/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="../../_ref.d.ts" />
/// <reference path="../object.ts" />
/// <reference path="../promise.ts" />
/// <reference path="../EventLog.ts" />
/// <reference path="../date.ts" />
/// <reference path="../hash.ts" />
/// <reference path="../typeOf.ts" />
/// <reference path="../file.ts" />
/// <reference path="../Koder.ts" />
/// <reference path="../Notification.ts" />
/// <reference path="HTTPCache.ts" />
/// <reference path="CacheMode.ts" />

module xm {
	'use strict';

	var Q = require('q');
	var fs = require('fs');
	var path = require('path');
	var tv4:TV4 = require('tv4');
	var FS:typeof QioFS = require('q-io/fs');

	var es = require('event-stream');
	var zlib = require('zlib');
	var request = require('request');
	var BufferStream = require('bufferstream');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export module http {

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// TODO rework downloader to write directly to disk using streams
		// - this may require a switch on whether we want to update disk
		// - integrate with CacheOpts.compressStore
		// TODO rework this to allow to keep stale content if we can't get new
		export class CacheStreamLoader {

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

			cache:HTTPCache;
			request:CacheRequest;
			object:CacheObject;
			infoCacheValidator:IObjectValidator;
			bodyCacheValidator:IObjectValidator;
			track:xm.EventLog;

			private _defer:Q.Deferred<CacheObject>;

			constructor(cache:HTTPCache, request:CacheRequest) {
				this.cache = cache;
				this.request = request;

				this.bodyCacheValidator = new ChecksumValidator();

				if (this.cache.opts.remoteRead) {
					this.infoCacheValidator = new CacheAgeValidator(this.cache.infoSchema, request.localMaxAge);
				}
				else {
					this.infoCacheValidator = new CacheValidator(this.cache.infoSchema);
				}
				this.track = new xm.EventLog('http_load', 'CacheStreamLoader');

				this.object = new CacheObject(this.request);
				this.object.storeDir = xm.file.distributeDir(this.cache.storeDir, this.request.key,
					this.cache.opts.splitDirLevel, this.cache.opts.splitDirChunk);

				this.object.bodyFile = path.join(this.object.storeDir, this.request.key + '.raw');
				this.object.infoFile = path.join(this.object.storeDir, this.request.key + '.json');

				xm.object.lockProps(this, ['cache', 'request', 'object']);
			}

			destruct():void {
				this._defer = null;
			}

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

			private canUpdate():boolean {
				if (this.cache.opts.cacheRead && this.cache.opts.remoteRead && this.cache.opts.cacheWrite) {
					return true;
				}
				return false;
			}

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

			getObject():Q.Promise<CacheObject> {
				// cache/load flow, the clousure  is only called when no matching keyTerm was found (or cache was locked)
				if (this._defer) {
					this.track.skip(CacheStreamLoader.get_object);
					return this._defer.promise;
				}

				this._defer = Q.defer();
				this.track.promise(this._defer.promise, CacheStreamLoader.get_object);

				// check the cache
				this.cacheRead().progress(this._defer.notify).then(() => {
					var useCached = false;
					if (this.object.body && this.object.info) {
						// check if we want to use this object
						useCached = !this.request.forceRefresh;
						if (useCached && xm.isNumber(this.request.httpInterval) && this.cache.opts.cacheWrite) {
							if (new Date(this.object.info.cacheUpdated).getTime() < Date.now() - this.request.httpInterval) {
								this._defer.notify(xm.getNote('update: ' + this.request.url + ' -> ' + this.request.key));
								useCached = false;
							}
						}
					}

					if (useCached) {
						return this.cacheTouch().then(() => {
							this._defer.notify(xm.getNote('local: ' + this.request.url + ' -> ' + this.request.key));
							this._defer.resolve(this.object);
						});
					}

					// lets load it
					return this.httpLoad(!this.request.forceRefresh).progress(this._defer.notify).then(() => {
						if (!xm.isValid(this.object.body)) {
							throw new Error('no result body: ' + this.request.url + ' -> ' + this.request.key);
						}
						this._defer.resolve(this.object);
					});
				}).fail((err) => {
					this._defer.reject(err);
					this._defer = null;
				}).done();

				return this._defer.promise;
			}

			private cacheRead():Q.Promise<void> {
				if (!this.cache.opts.cacheRead) {
					this.track.skip(CacheStreamLoader.cache_read);
					return Q().thenResolve();
				}
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, CacheStreamLoader.cache_read);

				this.readInfo().progress(d.notify).then(() => {
					if (!this.object.info) {
						throw new Error('no or invalid info object');
					}
					try {
						this.infoCacheValidator.assert(this.object);
					}
					catch (err) {
						// either bad or just stale
						this.track.event(CacheStreamLoader.local_info_bad, 'cache-info unsatisfactory', err);
						d.notify(xm.getNote('cache info unsatisfactory: ' + err.message, xm.LogLevel.status, err));
						// TODO rework this to allow to keep stale content if request fails (see note above class)
						throw err;
					}

					return FS.read(this.object.bodyFile, {flags: 'rb'}).then((buffer:NodeBuffer) => {
						if (buffer.length === 0) {
							throw new Error('empty body file');
						}
						this.object.bodyChecksum = xm.sha1(buffer);
						this.object.body = buffer;
					});
				}).then(() => {
					// validate it
					try {
						this.bodyCacheValidator.assert(this.object);
						// valid local cache hit
						this.track.event(CacheStreamLoader.local_cache_hit);
						d.resolve();
						return;
					}
					catch (err) {
						// this is bad
						this.track.error(CacheStreamLoader.local_body_bad, 'cache-body invalid:' + err.message, err);
						this.track.logger.error('cache invalid');
						this.track.logger.inspect(err);
						throw err;
					}
				}).fail((err) => {
					// clean up bad cache
					this.object.info = null;
					this.object.body = null;
					this.object.bodyChecksum = null;

					return this.cacheRemove().then(d.resolve, d.reject, d.notify);
				}).done();

				return d.promise;
			}

			// rtfm: https://www.mobify.com/blog/beginners-guide-to-http-cache-headers/
			private httpLoad(httpCache:boolean = true) {
				if (!this.cache.opts.remoteRead) {
					this.track.skip(CacheStreamLoader.http_load);
					return Q().thenResolve();
				}
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, CacheStreamLoader.http_load);

				// assemble request
				var req = {
					url: this.request.url,
					headers: {},
				};
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

				// print some stuff
				this.track.start(CacheStreamLoader.http_load);
				if (this.track.logEnabled) {
					this.track.logger.inspect(this.request);
					this.track.logger.inspect(req);
				}
				d.notify(xm.getNote('loading: ' + this.request.url));

				// memory stream for now
				var writer = new BufferStream({size: 'flexible'});
				// pause it so we don't miss chunks before we choose a decoder
				var pause = es.pause();
				pause.pause();

				// start loading
				request.get(req).on('response', (res) => {
					if (this.track.logEnabled) {
						this.track.logger.status(String(res.statusCode) + ' ' + this.request.url);
						this.track.logger.inspect(res.headers);
					}

					// keep some info
					this.object.response = new ResponseInfo();
					this.object.response.status = res.statusCode;
					this.object.response.headers = res.headers;

					// check status
					if (res.statusCode < 200 || res.statusCode >= 400) {
						this.track.error(CacheStreamLoader.http_load);
						d.reject(new Error('unexpected status code: ' + res.statusCode + ' on: ' + this.request.url));
						return;
					}
					if (res.statusCode === 304) {
						if (!this.object.body) {
							d.reject(new Error('flow error: http 304 but no local content on: ' + this.request.url));
							return;
						}
						if (!this.object.info) {
							d.reject(new Error('flow error: http 304 but no local info on: ' + this.request.url));
							return;
						}
						// cache hit!
						this.track.event(CacheStreamLoader.http_cache_hit);

						this._defer.notify(xm.getNote('remote: ' + this.request.url + ' -> ' + this.request.key, res.statusCode));

						this.updateInfo(res, this.object.info.contentChecksum);

						this.cacheWrite(true).done(d.resolve, d.reject);
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
						var checksum = xm.sha1(body);

						if (this.object.info) {
							if (this.object.info.contentChecksum) {
								// xm.assert(checksum === this.object.info.contentChecksum,
								//  '{a} !== {b}', checksum, this.object.info.contentChecksum);
							}
							this.updateInfo(res, checksum);
						}
						else {
							this.copyInfo(res, checksum);
						}
						this.object.body = body;

						this._defer.notify(xm.getNote('remote: ' + this.request.url + ' -> ' + this.request.key, 'http ' + res.statusCode));
						this.track.complete(CacheStreamLoader.http_load);

						this.cacheWrite(false).done(d.resolve, d.reject, d.notify);
					});

					// restart stream with proper setup
					pause.resume();

				}).pipe(pause).on('error', (err) => {
					this.track.complete(CacheStreamLoader.http_error, 'request error');
					d.reject(err);
				});

				return d.promise;
			}

			private cacheWrite(cacheWasFresh:boolean):Q.Promise<void> {
				if (!this.cache.opts.cacheWrite) {
					this.track.skip(CacheStreamLoader.cache_write);
					return Q().thenResolve();
				}
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, CacheStreamLoader.cache_write);

				if (this.object.body.length === 0) {
					d.reject(new Error('wont write empty file to ' + this.object.bodyFile));
					return;
				}

				this.cache.infoKoder.encode(this.object.info).then((info:NodeBuffer) => {
					if (info.length === 0) {
						d.reject(new Error('wont write empty info file ' + this.object.infoFile));
						return;
					}
					// assemble some writes
					var write = [];
					if (!cacheWasFresh) {
						if (this.object.body.length === 0) {
							d.reject(new Error('wont write empty body file ' + this.object.bodyFile));
							return;
						}

						write.push(xm.file.mkdirCheckQ(path.dirname(this.object.bodyFile), true).then(() => {
							return FS.write(this.object.bodyFile, this.object.body, {flags: 'wb'});
						}).then(() => {
							this.track.event(CacheStreamLoader.cache_write, 'written file to cache');
						}));
					}
					else {
						this.track.skip(CacheStreamLoader.cache_write, 'cache was fresh');
					}

					// write info file with udpated data
					write.push(xm.file.mkdirCheckQ(path.dirname(this.object.infoFile), true).then(() => {
						return FS.write(this.object.infoFile, info, {flags: 'wb'});
					}));

					// track em
					return Q.all(write).fail((err:Error) => {
						this.track.error(CacheStreamLoader.cache_write, 'file write', err);
						throw err;
					}).then(() => {
						// ghost stat to fix weird empty file glitch (voodoo.. only on windows?)
						return Q.all([
							this.checkExists(this.object.bodyFile, 'body').progress(d.notify),
							this.checkExists(this.object.infoFile, 'info').progress(d.notify)
						]);
					}).then(() => {
						return this.cacheTouch();
					});
				}).done(d.resolve, d.reject);

				return d.promise;
			}

			private checkExists(file:string, label:string):Q.Promise<boolean> {
				var d:Q.Deferred<boolean> = Q.defer();
				FS.exists(file).then((exist:boolean) => {
					if (exist) {
						return FS.stat(file).then((stat:QioFS.Stats) => {
							if (stat.size === 0) {
								d.notify(xm.getNote('written zero ' + label + ' bytes to: ' + file, xm.LogLevel.error));
								d.resolve(false);
							}
							else {
								d.resolve(true);
							}
						});
					}
					else {
						d.notify(xm.getNote('missing ' + label + ' file: ' + file, xm.LogLevel.error));
						d.resolve(false);
					}
				}).fail(d.reject);
				return d.promise;
			}

			private cacheRemove():Q.Promise<void> {
				// maybe less strict check?
				if (!this.canUpdate()) {
					return Q.resolve();
				}
				return Q.all([
					xm.file.removeFile(this.object.infoFile),
					xm.file.removeFile(this.object.bodyFile),
				]).then(() => {
					this.track.event(CacheStreamLoader.cache_remove, this.request.url);
				});
			}

			private cacheTouch():Q.Promise<void> {
				var d:Q.Deferred<void> = Q.defer();
				if (!this.canUpdate()) {
					return Q.resolve();
				}
				Q.all([
					xm.file.touchFile(this.object.infoFile),
					xm.file.touchFile(this.object.bodyFile)
				]).done(() => {
					d.resolve();
				}, d.reject);
				return d.promise;
			}

			private copyInfo(res:QioHTTP.Response, checksum:string) {
				xm.assertVar(checksum, 'sha1', 'checksum');
				var info:CacheInfo = <CacheInfo>{};
				this.object.info = info;
				info.url = this.request.url;
				info.key = this.request.key;
				info.contentType = res.headers['content-type'];
				// TODO why not keep http date format? (reformatting is safest?)
				info.cacheCreated = xm.date.getISOString(Date.now());
				info.cacheUpdated = xm.date.getISOString(Date.now());
				this.updateInfo(res, checksum);
			}

			private updateInfo(res:QioHTTP.Response, checksum:string) {
				var info = this.object.info;
				info.httpETag = (res.headers['etag'] || info.httpETag);
				// TODO why not keep http date format? (reformatting is safest?)
				info.httpModified = xm.date.getISOString((res.headers['last-modified'] ? new Date(res.headers['last-modified']) : new Date()));
				info.cacheUpdated = xm.date.getISOString(Date.now());
				info.contentChecksum = checksum;
			}

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

			private readInfo():Q.Promise<void> {
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, CacheStreamLoader.info_read);

				FS.isFile(this.object.infoFile).then((isFile:boolean) => {
					if (!isFile) {
						return null;
					}
					return FS.read(this.object.infoFile, {flags: 'rb'}).then((buffer:NodeBuffer) => {
						if (buffer.length === 0) {
							this.track.event(CacheStreamLoader.local_info_empty, 'empty info file');
							return null;
						}
						return this.cache.infoKoder.decode(buffer).then((info:CacheInfo) => {
							// TODO do we need this test?
							xm.assert((info.url === this.request.url), 'info.url {a} is not {e}', info.url, this.request.url);
							xm.assert((info.key === this.request.key), 'info.key {a} is not {e}', info.key, this.request.key);

							this.object.info = info;
						}).fail((err) => {
							this.track.event(CacheStreamLoader.local_info_malformed, 'mlaformed info file');
							throw err;
						});
					});
				}).then(() => {
					d.resolve();
				}, d.reject).done();
				return d.promise;
			}

			toString():string {
				return this.request ? this.request.url : '<no request>';
			}
		}
	}
}
