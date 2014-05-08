/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');

import path = require('path');
import Promise = require('bluebird');
import joiAssert = require('joi-assert');

import zlib = require('zlib');
import request = require('request');
import Request = request.Request;

import es = require('event-stream');
import BufferStream = require('bufferstream');

import typeOf = require('../xm/typeOf');
import assert = require('../xm/assert');
import assertVar = require('../xm/assertVar');
import dateUtils = require('../xm/dateUtils');
import hash = require('../xm/hash');
import LogLevel = require('../xm/log/LogLevel');

import fileIO = require('../xm/file/fileIO');

import HTTPCache = require('./HTTPCache');
import HTTPOpts = require('./HTTPOpts');

import CacheInfo = require('./CacheInfo');
import CacheRequest = require('./CacheRequest');
import CacheObject = require('./CacheObject');
import ResponseInfo = require('./ResponseInfo');

import types = require('./types');

// TODO rework downloader to write directly to disk using streams
// - this may require a switch on whether we want to update disk
// - integrate with CacheOpts.compressStore
// TODO rework this to allow to keep stale content if we can't get new
class CacheStreamLoader {

	opts: HTTPOpts;

	request: CacheRequest;
	object: CacheObject;

	private _promise: Promise<CacheObject>;

	constructor(opts: HTTPOpts, request: CacheRequest) {
		assertVar(opts, 'object', 'opts');
		assertVar(request, 'object', 'request');

		this.opts = opts;
		this.request = request;

		this.object = new CacheObject(this.request);
		this.object.storeDir = fileIO.distributeDir(
			this.opts.cache.storeDir,
			this.request.key,
			this.opts.cache.splitDirLevel,
			this.opts.cache.splitDirChunk
		);

		this.object.bodyFile = path.join(this.object.storeDir, this.request.key + '.raw');
		this.object.infoFile = path.join(this.object.storeDir, this.request.key + '.json');
	}

	private dropContent() {
		this._promise = null;

		var obj = new CacheObject(this.object.request);
		obj.storeDir = this.object.storeDir;
		obj.bodyFile = this.object.bodyFile;
		obj.infoFile = this.object.infoFile;
		this.object = obj;
	}

	destruct(): void {
		this._promise = null;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

	private canUpdate(): boolean {
		if (this.opts.cache.cacheRead && this.opts.cache.remoteRead && this.opts.cache.cacheWrite) {
			return true;
		}
		return false;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

	getObject(): Promise<CacheObject> {
		// cache/load flow, the clousure  is only called when no matching keyTerm was found (or cache was locked)
		if (this._promise) {
			return this._promise;
		}
		// check the cache
		return this._promise = this.cacheRead().then(() => {
			var useCached = false;
			if (this.object.body && this.object.info) {
				// check if we want to use this object
				useCached = !this.request.forceRefresh;

				if (useCached && typeOf.isNumber(this.request.httpInterval) && this.opts.cache.cacheWrite) {
					if (new Date(this.object.info.cacheUpdated).getTime() < Date.now() - this.request.httpInterval) {
						useCached = false;
					}
				}
			}
			if (useCached) {
				return this.cacheTouch().then(() => {
					return this.object;
				});
			}
			// lets load it
			return this.httpLoad(!this.request.forceRefresh).then(() => {
				if (!typeOf.isValid(this.object.body)) {
					throw new Error('no result body: ' + this.request.url + ' -> ' + this.request.key);
				}
				return this.object;
			});
		}).then(() => {
			return this.object;
		}, (err) => {
			this.dropContent();
			throw err;
		});
	}

	private cacheRead(): Promise<void> {
		if (!this.opts.cache.cacheRead) {
			return Promise.resolve();
		}
		return this.readInfo().then(() => {
			if (!this.object.info) {
				throw new Error('no or invalid info object');
			}
			if (this.opts.cache.remoteRead) {
				// validate it
				if (typeOf.isNumber(this.request.localMaxAge)) {
					var date = new Date(this.object.info.cacheUpdated);
					var compare = new Date();
					assert(date.getTime() < compare.getTime() + this.request.localMaxAge,
						'date {a} vs {e}', date.toISOString(), compare.toISOString());
				}
			}

			return fileIO.read(this.object.bodyFile).then((buffer: Buffer) => {
				if (buffer.length === 0) {
					throw new Error('empty body file');
				}
				this.object.bodyChecksum = hash.sha1(buffer);
				this.object.body = buffer;
			});
		}).then(() => {
			// validate it
			joiAssert(this.object, types.objectSchema);
			assert(this.object.bodyChecksum === this.object.info.contentChecksum,
				'checksum {a} vs {e}', this.object.info.contentChecksum, this.object.bodyChecksum);

			// valid local cache hit
			return this.object;
		}).catch((err) => {
			// clean up bad cache
			this.dropContent();
			return this.cacheRemove().return(null);
		});
	}

	// rtfm: https://www.mobify.com/blog/beginners-guide-to-http-cache-headers/
	private httpLoad(httpCache: boolean = true): Promise<void> {
		if (!this.opts.cache.remoteRead) {
			return Promise.resolve();
		}
		return new Promise<void>((resolve, reject) => {
			// assemble request
			var req: any = {
				url: this.request.url,
				headers: {}
			};

			if (this.opts.proxy) {
				req.proxy = this.opts.proxy;
			}

			Object.keys(this.request.headers).forEach((key) => {
				req.headers[key] = String(this.request.headers[key]);
			});

			// set cache headers
			if (this.object.info && this.object.body && httpCache) {
				if (this.object.info.httpETag) {
					req.headers['if-none-match'] = this.object.info.httpETag;
				}
				if (this.object.info.httpModified) {
					req.headers['if-modified-since'] = new Date(this.object.info.httpModified).toUTCString();
				}
			}
			// always zip
			req.headers['accept-encoding'] = 'gzip, deflate';

			// d.progress(getNote('loading: ' + this.request.url));

			// memory stream for now
			var writer = new BufferStream({size: 'flexible'});
			// pause it so we don't miss chunks before we choose a decoder
			var pause = es.pause();
			pause.pause();

			// start loading
			var r = request.get(req);
			r.on('response', (res) => {
				// keep some info
				this.object.response = new ResponseInfo();
				this.object.response.status = res.statusCode;
				this.object.response.headers = res.headers;

				// check status
				if (res.statusCode < 200 || res.statusCode >= 400) {
					// TODO add custom errors
					reject(new Error('unexpected status code: ' + res.statusCode + ' on: ' + this.request.url));
					return;
				}
				if (res.statusCode === 304) {
					if (!this.object.body) {
						reject(new Error('flow error: http 304 but no local content on: ' + this.request.url));
						return;
					}
					if (!this.object.info) {
						reject(new Error('flow error: http 304 but no local info on: ' + this.request.url));
						return;
					}
					// cache hit!

					this.updateInfo(res, this.object.info.contentChecksum);

					this.cacheWrite(true).then(resolve, reject);
					return;
				}

				// pick and pipe paused stream to decoder
				switch (res.headers['content-encoding']) {
					case 'gzip':
						pause.pipe(zlib.createGunzip()).pipe(writer);
						break;
					case 'deflate':
						pause.pipe(zlib.createInflate()).pipe(writer);
						break;
					default:
						pause.pipe(writer);
						break;
				}

				// setup completion handler
				writer.on('end', () => {
					var body = writer.getBuffer();
					if (!body) {
						// shouldn't we test
						throw new Error('flow error: http 304 but no local info on: ' + this.request.url);
					}
					if (body.length === 0) {
						throw new Error('loaded zero bytes ' + this.request.url);
					}
					var checksum = hash.sha1(body);

					if (this.object.info) {
						if (this.object.info.contentChecksum) {
							// assert(checksum === this.object.info.contentChecksum,
							//  '{a} !== {b}', checksum, this.object.info.contentChecksum);
						}
						this.updateInfo(res, checksum);
					}
					else {
						this.copyInfo(res, checksum);
					}
					this.object.body = body;

					this.cacheWrite(false).done(resolve, reject);
				});
				// restart stream with proper setup
				pause.resume();
			});
			r.pipe(pause).on('error', (err) => {
				reject(err);
			});
		});
	}

	private cacheWrite(cacheWasFresh: boolean): Promise<void> {
		if (!this.opts.cache.cacheWrite) {
			return Promise.resolve();
		}

		return Promise.try(() => {
			if (this.object.body.length === 0) {
				throw new Error('wont write empty file to ' + this.object.bodyFile);
			}
			// assemble some writes
			var write = [];
			if (!cacheWasFresh) {
				write.push(fileIO.write(this.object.bodyFile, this.object.body));
			}

			// write info file with udpated data
			write.push(fileIO.writeJSON(this.object.infoFile, this.object.info));

			// track em
			return Promise.all(write).then(() => {
				// ghost stat to fix weird empty file glitch (voodoo.. only on windows?)
				return Promise.all([
					this.checkExists(this.object.bodyFile, 'body'),
					this.checkExists(this.object.infoFile, 'info')
				]);
			}).then(() => {
				return this.cacheTouch();
			});
		});
	}

	private checkExists(file: string, label: string): Promise<boolean> {
		return fileIO.exists(file).then((exist: boolean) => {
			if (!exist) {
				// d.progress(getNote('missing ' + label + ' file: ' + file, LogLevel.error));
				return Promise.cast(false);
			}
			return fileIO.stat(file).then((stat: fs.Stats) => {
				if (stat.size === 0) {
					// d.progress(getNote('written zero ' + label + ' bytes to: ' + file, LogLevel.error));
					return false;
				}
				return true;
			});
		});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

	private cacheRemove(): Promise<void> {
		// maybe less strict check?
		if (!this.canUpdate()) {
			return Promise.resolve();
		}
		return Promise.all([
			fileIO.removeFile(this.object.infoFile),
			fileIO.removeFile(this.object.bodyFile),
		]).return();
	}

	private cacheTouch(): Promise<void> {
		if (!this.canUpdate()) {
			return Promise.resolve();
		}
		return Promise.all([
			fileIO.touchFile(this.object.infoFile),
			fileIO.touchFile(this.object.bodyFile)
		]).return();
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

	private readInfo(): Promise<void> {
		return fileIO.isFile(this.object.infoFile).then((isFile: boolean) => {
			if (!isFile) {
				return null;
			}
			return fileIO.readJSON(this.object.infoFile).then((info: CacheInfo) => {
				info = joiAssert(info, types.infoSchema);
				// TODO do we need this test? fold into Joi
				assert((info.url === this.request.url), 'info.url {a} is not {e}', info.url, this.request.url);
				assert((info.key === this.request.key), 'info.key {a} is not {e}', info.key, this.request.key);
				this.object.info = info;
			});
		});
	}

	private copyInfo(res: ResponseInfo, checksum: string) {
		var info: CacheInfo = <CacheInfo>{};
		info.url = this.request.url;
		info.key = this.request.key;
		info.contentType = res.headers['content-type'];
		// TODO why not keep http date format? (reformatting is safest?)
		info.cacheCreated = dateUtils.getISOString(Date.now());
		info.cacheUpdated = info.cacheCreated;

		this.object.info = info;

		this.updateInfo(res, checksum);
	}

	private updateInfo(res: ResponseInfo, checksum: string) {
		var info = this.object.info;
		info.httpETag = (res.headers['etag'] || info.httpETag);
		// TODO why not keep http date format? (reformatting is safest?)
		info.httpModified = dateUtils.getISOString((res.headers['last-modified'] ? new Date(res.headers['last-modified']) : new Date()));
		info.cacheUpdated = dateUtils.getISOString(Date.now());
		info.contentChecksum = checksum;
	}

	toString(): string {
		return this.request ? this.request.url : '<no request>';
	}
}

export = CacheStreamLoader;
