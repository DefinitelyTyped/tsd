///<reference path="../../_ref.d.ts" />
///<reference path="../ObjectUtil.ts" />
///<reference path="../promise.ts" />
///<reference path="../EventLog.ts" />
///<reference path="../hash.ts" />
///<reference path="../typeOf.ts" />
///<reference path="../io/FileUtil.ts" />
///<reference path="../io/Koder.ts" />
///<reference path="HTTPCache.ts" />
/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */
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

	require('date-utils');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function getISOString(input:any):string {
		var date:Date;
		if (xm.isDate(input)) {
			date = input;
		}
		else if (xm.isString(input) || xm.isNumber(input)) {
			date = new Date(input);
		}
		return (date ? date.toISOString() : null);
	}

	function distributeDir(base:string, name:string, levels:number, chunk:number = 1):string {
		name = name.replace(/(^[\\\/]+)|([\\\/]+$)/g, '');
		if (levels === 0) {
			return base;
		}
		var arr = [base];
		var steps = Math.max(0, Math.min(name.length - 2, levels * chunk));
		for (var i = 0; i < steps; i += chunk) {
			arr.push(name.substr(i, chunk));
		}
		return path.join.apply(path, arr);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export module http {

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		//TODO rework downloader to write directly to disk using streams (maybe drop q-io for downloading)
		// - this may require a switch on whether we want to update disk
		// - see old slimer-js cache downlaoder (request.js + fs.createWriteStream + gunzip )
		// - pipe switched on header: https://gist.github.com/nickfishman/5515364
		// - integrate with CacheOpts.compressStore
		//TODO rework this to allow to keep stale content if we can't get new
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
			request:Request;
			object:CacheObject;
			infoCacheValidator:IObjectValidator;
			bodyCacheValidator:IObjectValidator;
			track:xm.EventLog;

			private _defer:Q.Deferred<CacheObject>;

			constructor(cache:HTTPCache, request:Request) {
				this.cache = cache;
				this.request = request;

				this.bodyCacheValidator = new ChecksumValidator();

				if (this.cache.opts.remoteRead) {
					this.infoCacheValidator = new CacheAgeValidator(this.cache.infoSchema, request.localMaxAge);
				}
				else {
					this.infoCacheValidator = new CacheValidator(this.cache.infoSchema);
				}

				this.object = new CacheObject(request);
				this.object.storeDir = distributeDir(this.cache.storeDir, this.request.key, this.cache.opts.splitKeyDir);

				this.object.bodyFile = path.join(this.object.storeDir, this.request.key + '.raw');
				this.object.infoFile = path.join(this.object.storeDir, this.request.key + '.json');

				this.track = new xm.EventLog('http_load', 'CacheStreamLoader');

				xm.ObjectUtil.lockProps(this, ['cache', 'request', 'object']);
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
				//cache/load flow, the clousure  is only called when no matching keyTerm was found (or cache was locked)
				if (this._defer) {
					this.track.skip(CacheStreamLoader.get_object);
					return this._defer.promise;
				}

				this._defer = Q.defer();
				this.track.promise(this._defer.promise, CacheStreamLoader.get_object);

				var cleanup = () => {
					//TODOset timeout
					this._defer = null;
				};

				// check the cache
				this.cacheRead().progress(this._defer.notify).then(() => {
					var useCached = false;
					if (this.object.body && this.object.info) {
						useCached = !this.request.forceRefresh;
						if (useCached && xm.isNumber(this.request.httpInterval)) {
							if (new Date(this.object.info.cacheUpdated).getTime() < Date.now() - this.request.httpInterval) {
								this._defer.notify('auto check update on interval: ' + this.request.url);
								useCached = false;
							}
						}
					}

					if (useCached) {
						return this.cacheTouch().then(() => {
							this._defer.notify('using local cache: ' + this.request.url);
							this._defer.resolve(this.object);
						});
					}

					// lets load it
					return this.httpLoad(!this.request.forceRefresh).progress(this._defer.notify).then(() => {
						if (!xm.isValid(this.object.body)) {
							throw new Error('no result body: ' + this.object.request.url);
						}
						this._defer.notify('fetched remote: ' + this.request.url);
						this._defer.resolve(this.object);
					});
				}).fail((err) => {
					this._defer.reject(err);
				}).finally(() => {
					cleanup();
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
						d.notify('cache info unsatisfactory: ' + err);
						//TODO rework this to allow to keep stale content if request fails (see note above class)
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
					//validate it
					try {
						this.bodyCacheValidator.assert(this.object);
						//valid local cache hit
						this.track.event(CacheStreamLoader.local_cache_hit);
						d.resolve();
						return;
					}
					catch (err) {
						//this is bad
						this.track.error(CacheStreamLoader.local_body_bad, 'cache-body invalid:' + err.message, err);
						this.track.logger.error('cache invalid');
						this.track.logger.inspect(err);
						throw err;
					}
				}).fail((err) => {
					//clean up bad cache
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
						//TODO verify/fix date format
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
				d.notify('loading: ' + this.request.url);

				// memory stream for now
				var writer = new BufferStream({size: 'flexible'});
				// pause it so we don't miss chunks before we choose a decoder
				var pause = es.pause();
				pause.pause();

				// start loading
				request.get(req).on('response', (res) => {
					d.notify('status: ' + String(res.statusCode) + ' ' + this.request.url);

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
						d.reject(new Error('unexpected status code: ' + res.statusCode + ' on ' + this.request.url));
						return;
					}
					if (res.statusCode === 304) {
						if (!this.object.body) {
							d.reject(new Error('flow error: http 304 but no local content on ' + this.request.url));
							return;
						}
						if (!this.object.info) {
							d.reject(new Error('flow error: http 304 but no local info on ' + this.request.url));
							return;
						}
						//cache hit!
						this.track.event(CacheStreamLoader.http_cache_hit);

						this.updateInfo(res, this.object.info.contentChecksum);

						this.cacheWrite(true).done(d.resolve, d.reject);
						return;
					}

					// pick and pipe pasued stream to decoder
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
							throw new Error('flow error: http 304 but no local info on ' + this.request.url);
						}
						if (body.length === 0) {
							throw new Error('loaded zero bytes ' + this.request.url);
						}
						var checksum = xm.sha1(body);

						if (this.object.info) {
							if (this.object.info.contentChecksum) {
								//xm.assert(checksum === this.object.info.contentChecksum, '{a} !== {b}', checksum, this.object.info.contentChecksum);
							}
							this.updateInfo(res, checksum);
						}
						else {
							this.copyInfo(res, checksum);
						}
						this.object.body = body;

						d.notify('complete: ' + this.request.url + ' ' + String(res.statusCode));
						this.track.complete(CacheStreamLoader.http_load);

						this.cacheWrite(false).done(d.resolve, d.reject, d.notify);
					});

					//restart stream with proper setup
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

						write.push(xm.FileUtil.mkdirCheckQ(path.dirname(this.object.bodyFile), true).then(() => {
							return FS.write(this.object.bodyFile, this.object.body, {flags: 'wb'});
						}).then(() => {
							this.track.event(CacheStreamLoader.cache_write, 'written file to cache');
						}));
					}
					else {
						this.track.skip(CacheStreamLoader.cache_write, 'cache was fresh');
					}

					// write info file with udpated data
					write.push(xm.FileUtil.mkdirCheckQ(path.dirname(this.object.infoFile), true).then(() => {
						return FS.write(this.object.infoFile, info, {flags: 'wb'});
					}));

					// track em
					return Q.all(write).fail((err:Error) => {
						this.track.error(CacheStreamLoader.cache_write, 'file write', err);
						//TODO clean things up?
						throw err;
					}).then(() => {
						// ghost stat to fix weird empty file glitch (voodoo.. only on windows?)
						return Q.all([
							FS.stat(this.object.bodyFile).then((stat:QioFS.Stats) => {
								if (stat.size === 0) {
									this.track.error(CacheStreamLoader.cache_write, 'written zero body bytes');
									d.notify(new Error('written zero body bytes'));
								}
							}),
							FS.stat(this.object.infoFile).then((stat:QioFS.Stats) => {
								if (stat.size === 0) {
									this.track.error(CacheStreamLoader.cache_write, 'written zero info bytes');
									d.notify(new Error('written zero info bytes'));
								}
							})
						]);
					}).then(() => {
						return this.cacheTouch();
					});
				}).done(d.resolve, d.reject);

				return d.promise;
			}

			private cacheRemove():Q.Promise<void> {
				// maybe less strict check?
				if (!this.canUpdate()) {
					return Q.resolve();
				}
				return Q.all([
					xm.FileUtil.removeFile(this.object.infoFile),
					xm.FileUtil.removeFile(this.object.bodyFile),
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
					xm.FileUtil.touchFile(this.object.infoFile),
					xm.FileUtil.touchFile(this.object.bodyFile)
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
				info.cacheCreated = getISOString(Date.now());
				info.cacheUpdated = getISOString(Date.now());
				this.updateInfo(res, checksum);
			}

			private updateInfo(res:QioHTTP.Response, checksum:string) {
				var info = this.object.info;
				info.httpETag = (res.headers['etag'] || info.httpETag);
				info.httpModified = getISOString((res.headers['last-modified'] ? new Date(res.headers['last-modified']) : new Date()));
				info.cacheUpdated = getISOString(Date.now());
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
							//TODO do we need this test?
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
