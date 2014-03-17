/// <reference path="../_ref.d.ts" />

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');
import tv4 = require('tv4');

import zlib = require('zlib');
import request = require('request');
import Request = request.Request;

import es = require('event-stream');
var BufferStream = require('bufferstream');

import typeOf = require('../typeOf');
import assert = require('../assert');
import assertVar = require('../assertVar');
import objectUtils = require('../objectUtils');
import dateUtils = require('../dateUtils');
import hash = require('../hash');
import LogLevel = require('../log/LogLevel');

import fileIO = require('../file/fileIO');
import NodeStats = require('../file/NodeStats');
import Notification = require('../note/Notification');
import getNote = require('../note/getNote');

import validator = require('./validator');

import HTTPCache = require('./HTTPCache');
import CacheInfo = require('./CacheInfo');
import CacheRequest = require('./CacheRequest');
import CacheObject = require('./CacheObject');
import ResponseInfo = require('./ResponseInfo');

// TODO rework downloader to write directly to disk using streams
// - this may require a switch on whether we want to update disk
// - integrate with CacheOpts.compressStore
// TODO rework this to allow to keep stale content if we can't get new
class CacheStreamLoader {

	static get_object = 'get_object';
	static info_read = 'info_read';
	static cache_read = 'cache_read';
	static cache_write = 'cache_write';
	static cache_remove = 'cache_remove';
	static http_load = 'http_load';
	static http_error = 'http_error';
	static local_info_bad = 'local_info_bad';
	static local_info_empty = 'local_info_empty';
	static local_info_malformed = 'local_info_malformed';
	static local_body_bad = 'local_body_bad';
	static local_body_empty = 'local_body_empty';
	static local_cache_hit = 'local_cache_hit';
	static http_cache_hit = 'http_cache_hit';

	cache: HTTPCache;
	request: CacheRequest;
	object: CacheObject;
	infoCacheValidator: validator.IObjectValidator;
	bodyCacheValidator: validator.IObjectValidator;

	private _promise: Promise<CacheObject>;

	constructor(cache: HTTPCache, request: CacheRequest) {
		this.cache = cache;
		this.request = request;

		this.bodyCacheValidator = new validator.ChecksumValidator();

		if (this.cache.opts.remoteRead) {
			this.infoCacheValidator = new validator.CacheAgeValidator(this.cache.infoSchema, request.localMaxAge);
		}
		else {
			this.infoCacheValidator = new validator.CacheValidator(this.cache.infoSchema);
		}

		this.object = new CacheObject(this.request);
		this.object.storeDir = fileIO.distributeDir(this.cache.storeDir, this.request.key,
		this.cache.opts.splitDirLevel, this.cache.opts.splitDirChunk);

		this.object.bodyFile = path.join(this.object.storeDir, this.request.key + '.raw');
		this.object.infoFile = path.join(this.object.storeDir, this.request.key + '.json');

		objectUtils.lockProps(this, ['cache', 'request', 'object']);
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
		if (this.cache.opts.cacheRead && this.cache.opts.remoteRead && this.cache.opts.cacheWrite) {
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
				if (useCached && typeOf.isNumber(this.request.httpInterval) && this.cache.opts.cacheWrite) {
					if (new Date(this.object.info.cacheUpdated).getTime() < Date.now() - this.request.httpInterval) {
						// this._defer.progress(getNote('update: ' + this.request.url + ' -> ' + this.request.key));
						useCached = false;
					}
				}
			}
			if (useCached) {
				return this.cacheTouch().then(() => {
					// this._defer.progress(getNote('local: ' + this.request.url + ' -> ' + this.request.key));
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
		}).catch((err) => {
			this.dropContent();
			throw err;
		}).return(this.object);
	}

	private cacheRead(): Promise<void> {
		if (!this.cache.opts.cacheRead) {
			return Promise.resolve();
		}
		return this.readInfo().then(() => {
			if (!this.object.info) {
				throw new Error('no or invalid info object');
			}
			try {
				this.infoCacheValidator.assert(this.object);
			}
			catch (err) {
				// either bad or just stale
				// d.progress(getNote('cache info unsatisfactory: ' + err.message, LogLevel.status, err));
				// TODO rework this to allow to keep stale content if request fails (see note above class)
				throw err;
			}

			return fileIO.read(this.object.bodyFile, {flags: 'rb'}).then((buffer: NodeBuffer) => {
				if (buffer.length === 0) {
					throw new Error('empty body file');
				}
				this.object.bodyChecksum = hash.sha1(buffer);
				this.object.body = buffer;
			});
		}).then(() => {
			// validate it
			this.bodyCacheValidator.assert(this.object);
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
		if (!this.cache.opts.remoteRead) {
			return Promise.resolve();
		}
		return new Promise<void>((resolve, reject) => {
			// assemble request
			var req: any = {
				url: this.request.url,
				headers: {},
			};

			if (this.cache.proxy) {
				req.proxy = this.cache.proxy;
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
					// this._defer.progress(getNote('remote: ' + this.request.url + ' -> ' + this.request.key, res.statusCode));

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

					// this._defer.progress(getNote('remote: ' + this.request.url + ' -> ' + this.request.key, 'http ' + res.statusCode));

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
		if (!this.cache.opts.cacheWrite) {
			return Promise.resolve();
		}
		if (this.object.body.length === 0) {
			return Promise.reject(new Error('wont write empty file to ' + this.object.bodyFile));
		}
		return this.cache.infoKoder.encode(this.object.info).then((info: NodeBuffer) => {
			if (info.length === 0) {
				throw new Error('wont write empty info file ' + this.object.infoFile);
			}
			// assemble some writes
			var write = [];

			if (!cacheWasFresh) {
				if (this.object.body.length === 0) {
					throw new Error('wont write empty body file ' + this.object.bodyFile);
				}
				write.push(fileIO.mkdirCheckQ(path.dirname(this.object.bodyFile), true).then(() => {
					return fileIO.write(this.object.bodyFile, this.object.body, {flags: 'wb'});
				}));
			}

			// write info file with udpated data
			write.push(fileIO.mkdirCheckQ(path.dirname(this.object.infoFile), true).then(() => {
				return fileIO.write(this.object.infoFile, info, {flags: 'wb'});
			}));

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
			return fileIO.stat(file).then((stat: NodeStats) => {
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
			return fileIO.read(this.object.infoFile, {flags: 'rb'}).then((buffer: NodeBuffer) => {
				if (buffer.length === 0) {
					return null;
				}
				return this.cache.infoKoder.decode(buffer).then((info: CacheInfo) => {
					// TODO do we need this test?
					assert((info.url === this.request.url), 'info.url {a} is not {e}', info.url, this.request.url);
					assert((info.key === this.request.key), 'info.key {a} is not {e}', info.key, this.request.key);
					this.object.info = info;
				});
			});
		});
	}

	private copyInfo(res: ResponseInfo, checksum: string) {
		assertVar(checksum, 'sha1', 'checksum');
		var info: CacheInfo = <CacheInfo>{};
		this.object.info = info;
		info.url = this.request.url;
		info.key = this.request.key;
		info.contentType = res.headers['content-type'];
		// TODO why not keep http date format? (reformatting is safest?)
		info.cacheCreated = dateUtils.getISOString(Date.now());
		info.cacheUpdated = dateUtils.getISOString(Date.now());
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
