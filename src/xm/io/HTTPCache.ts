///<reference path="../../_ref.d.ts" />
///<reference path="../ObjectUtil.ts" />
///<reference path="../promise.ts" />
///<reference path="../EventLog.ts" />
///<reference path="../hash.ts" />
///<reference path="../typeOf.ts" />
///<reference path="FileUtil.ts" />
///<reference path="Koder.ts" />
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
	var HTTP:typeof QioHTTP = require('q-io/http');

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

		// a represent a single object in the cache
		export class CacheObject {
			request:Request;
			storeDir:string;

			infoFile:string;
			info:CacheInfo;

			response:ResponseInfo;

			bodyFile:string;
			bodyChecksum:string;
			body:NodeBuffer;

			constructor(request:Request) {
				this.request = request;
			}
		}

		// hold some interesting meta data
		export class ResponseInfo {
			status:number = 0;
			headers:any = {};
		}

		// meta data to keep on disk
		export interface CacheInfo {
			url:string;
			key:string;
			contentType:string;
			httpETag:string;
			httpModified:string;
			cacheCreated:string;
			contentChecksum:string;
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// mini json-schema
		var typeString = {'type': 'string'};
		var typeStringNull = {anyOf: [
			{'type': 'string'},
			{'type': 'null'}
		]};
		var typeObject = {'type': 'object'};

		//
		export var infoSchema = {
			title: 'CacheInfo',
			type: 'object',
			required: null,
			properties: {
				url: typeString,
				contentType: typeString,
				httpETag: typeStringNull,
				httpModified: typeStringNull,
				cacheCreated: typeString,
				contentChecksum: typeString
			}
		};
		infoSchema.required = Object.keys(infoSchema.properties);

		export function assertInfo(value:any):void {
			var res:TV4SingleResult = tv4.validateResult(value, infoSchema);
			if (!res.valid || res.missing.length > 0) {
				throw res.error;
			}
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		export enum CacheMode {
			forceLocal,
			forceRemote,
			forceUpdate,
			allowRemote,
			allowUpdate
		}

		export class CacheOpts {
			//TODO integrate compressStore with CacheInfo and streaming downloader
			compressStore:boolean = false;

			splitKeyDir:number = 0;

			cacheRead = true;
			cacheWrite = true;
			remoteRead = true;

			constructor(mode?:CacheMode) {
				if (mode) {
					this.applyCacheMode(mode);
				}
			}

			applyCacheMode(mode:CacheMode) {
				switch (mode) {
					case CacheMode.forceRemote:
						this.cacheRead = false;
						this.remoteRead = true;
						this.cacheWrite = false;
						break;
					case CacheMode.forceUpdate:
						this.cacheRead = false;
						this.remoteRead = true;
						this.cacheWrite = true;
						break;
					case CacheMode.allowUpdate:
						this.cacheRead = true;
						this.remoteRead = true;
						this.cacheWrite = true;
						break;
					case CacheMode.allowRemote:
						this.cacheRead = true;
						this.remoteRead = true;
						this.cacheWrite = false;
						break;
					case CacheMode.forceLocal:
					default:
						this.cacheRead = true;
						this.remoteRead = false;
						this.cacheWrite = false;
						break;
				}
			}
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// single request, hashes to a unique id
		export class Request {
			key:string;
			locked:boolean;

			url:string;
			headers:any;

			maxAge:number;
			checkHttp:boolean;

			constructor(url:string, headers?:any) {
				this.url = url;
				this.headers = headers || {};
			}

			lock():Request {
				this.locked = true;
				this.key = xm.jsonToIdentHash({
					url: this.url,
					headers: this.headers
				});
				xm.ObjectUtil.lockProps(this, ['key', 'url', 'headers', 'maxAge', 'locked']);
				//TODO maybe we should clone before freeze?
				xm.ObjectUtil.deepFreeze(this.headers);
				return this;
			}
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		export class HTTPCache {

			static get_object = 'get_object';
			static drop_job = 'drop_job';

			storeDir:string;
			private jobs = new xm.KeyValueMap<xm.http.CacheLoader>();
			opts:CacheOpts;
			track:xm.EventLog;
			infoKoder:IContentKoder<CacheInfo>;

			private remove = new xm.KeyValueMap<number>();

			// auto clear
			jobTimeout:number = 1000;

			private _init:Q.Promise<void>;

			constructor(storeDir:string, opts?:CacheOpts) {
				xm.assertVar(storeDir, 'string', 'storeDir');
				xm.assertVar(opts, CacheOpts, 'opts', true);

				this.storeDir = storeDir;
				this.opts = (opts || new CacheOpts());
				this.track = new xm.EventLog('http_cache', 'HTTPCache');
				this.track.unmuteActions([xm.Level.reject, xm.Level.notify]);

				this.infoKoder = new JSONKoder<CacheInfo>(infoSchema);
			}

			getObject(request:Request):Q.Promise<CacheObject> {
				xm.assertVar(request, xm.http.Request, 'request');
				xm.assert(request.locked, 'request must be lock()-ed {a}', request.url);

				var d:Q.Deferred<CacheObject> = Q.defer();
				this.track.start(HTTPCache.get_object, request.url);
				this.track.promise(d.promise, HTTPCache.get_object);

				this.init().then(() => {
					var job;
					if (this.jobs.has(request.key)) {
						job = this.jobs.get(request.key);
						this.track.skip(HTTPCache.get_object);

						return job.getObject().progress(d.notify).then(d.resolve);
					}
					else {
						job = new CacheLoader(this, request);
						this.jobs.set(request.key, job);

						job.track.logEnabled = this.track.logEnabled;
						this.track.start(HTTPCache.get_object);

						return job.getObject().progress(d.notify).then((value:any) => {
							this.track.complete(HTTPCache.get_object);
							d.resolve(value);
						});
					}
					this.scheduleRelease(request.key);
				}).fail(d.reject).done();

				return d.promise;
			}

			private scheduleRelease(key:string):void {
				if (this.jobs.has(key)) {
					if (this.remove.has(key)) {
						clearTimeout(this.remove.get(key));
					}
					this.remove.set(key, setTimeout(() => {
						this.track.event(HTTPCache.drop_job, 'droppped ' + key, this.jobs.get(key));
						//TODO why both?
						this.track.logger.debug(HTTPCache.drop_job, 'droppped ' + key, this.jobs.get(key));

						this.jobs.remove(key);

					}, this.jobTimeout));
				}
			}

			private init():Q.Promise<void> {
				if (this._init) {
					this.track.skip('init');
					return this._init;
				}
				var defer:Q.Deferred<void> = Q.defer();
				this._init = defer.promise;
				this.track.promise(defer.promise, 'init');

				FS.exists(this.storeDir).then((exists:boolean) => {
					if (!exists) {
						this.track.event('dir_create', this.storeDir);
						return xm.FileUtil.mkdirCheckQ(this.storeDir, true, true);
					}

					return FS.isDirectory(this.storeDir).then((isDir:boolean) => {
						if (isDir) {
							this.track.event('dir_exists', this.storeDir);
							return null;
						}
						this.track.error('dir_error', this.storeDir);
						throw new Error('is not a directory: ' + this.storeDir);
					});
				}).then(() => {
					defer.resolve(null);
				}, defer.reject).done();

				return defer.promise;
			}

			private getDir(key:string):boolean {
				return path.join(this.storeDir, key.charAt(0), key.charAt(1), key);
			}

			set verbose(verbose:boolean) {
				this.track.logEnabled = verbose;
			}
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		export interface IObjectValidator {
			assert(object:CacheObject):void
		}

		export class SimpleValidator implements IObjectValidator {
			assert(object:CacheObject):void {
				xm.assert(xm.isValid(object.body), 'body valid');
			}

			static main = new SimpleValidator();
		}


		export class CacheValidator implements IObjectValidator {
			assert(object:CacheObject):void {
				//assertInfo(object.info);
				//nothing more?
			}

			static main = new CacheValidator();
		}
		export class CacheAgeValidator implements IObjectValidator {
			maxAgeMili:number = 0;

			constructor(maxAgeMili?:number) {
				this.maxAgeMili = maxAgeMili;
			}

			assert(object:CacheObject):void {
				assertInfo(object.info);
				xm.assertVar(object.info.httpModified, 'string', 'httpModified');

				var date:Date = new Date(object.info.httpModified);
				if (xm.isNumber(this.maxAgeMili)) {
					var compare = new Date();
					xm.assert(date.getTime() < compare.getTime() + this.maxAgeMili, 'checksum {a} vs {e}', date.toISOString(), compare.toISOString());
				}
			}
		}

		export class ChecksumValidator implements IObjectValidator {
			assert(object:CacheObject):void {
				xm.assertVar(object.body, Buffer, 'body');
				xm.assertVar(object.bodyChecksum, 'sha1', 'bodyChecksum');
				xm.assertVar(object.info.contentChecksum, 'sha1', 'contentChecksum');
				xm.assert(object.info.contentChecksum === object.bodyChecksum, 'checksum', object.info.contentChecksum, object.bodyChecksum);
			}

			static main = new ChecksumValidator();
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		//TODO rework downloader to write directly to disk using streams (maybe drop q-io for downloading)
		// - this may require a switch on whether we want to update disk
		// - see old slimer-js cache downlaoder (request.js + fs.createWriteStream + gunzip )
		// - pipe switched on header: https://gist.github.com/nickfishman/5515364
		// - integrate with CacheOpts.compressStore
		//TODO rework this to allow to keep stale content if we can't get new
		export class CacheLoader {

			static get_object = 'get_object';
			static info_read = 'info_read';
			static cache_read = 'cache_read';
			static cache_write = 'cache_write';
			static cache_remove = 'cache_remove';
			static http_load = 'http_load';
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

				this.bodyCacheValidator = ChecksumValidator.main;

				if (this.cache.opts.remoteRead) {
					this.infoCacheValidator = new CacheAgeValidator(request.maxAge);
				}
				else {
					this.infoCacheValidator = new CacheValidator();
				}

				this.object = new CacheObject(request);
				this.object.storeDir = distributeDir(this.cache.storeDir, this.request.key, this.cache.opts.splitKeyDir);

				this.object.bodyFile = path.join(this.object.storeDir, this.request.key + '.raw');
				this.object.infoFile = path.join(this.object.storeDir, this.request.key + '.json');

				this.track = new xm.EventLog('http_load', 'CacheLoader');

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
					this.track.skip(CacheLoader.get_object);
					return this._defer.promise;
				}

				this._defer = Q.defer();
				this.track.promise(this._defer.promise, CacheLoader.get_object);

				var cleanup = () => {
					//TODOset timeout
					this._defer = null;
				};

				// check the cache
				this.cacheRead().progress(this._defer.notify).then(() => {
					if (this.object.body && !this.request.checkHttp) {
						this._defer.notify('using local cache: ' + this.request.url);

						this._defer.resolve(this.object);
						return;
					}

					// lets load it
					return this.httpLoad(true).progress(this._defer.notify).then(() => {
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
					this.track.skip(CacheLoader.cache_read);
					return Q().thenResolve();
				}
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, CacheLoader.cache_read);

				this.readInfo().progress(d.notify).then(() => {
					if (!this.object.info) {
						throw new Error('no or invalid info object');
					}
					try {
						this.infoCacheValidator.assert(this.object);
					}
					catch (err) {
						// either bad or just stale
						this.track.event(CacheLoader.local_info_bad, 'cache-info unsatisfactory', err);
						d.notify('cache info unsatisfactory: ' + err);
						//this.track.logger.inspect(err);

						//TODO rework this to allow to keep stale content if request fails (see note above class)

						this.object.info = null;
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
						this.track.event(CacheLoader.local_cache_hit);
						d.resolve();
						return;
					}
					catch (err) {
						//this is bad
						this.track.error(CacheLoader.local_body_bad, 'cache-body invalid:' + err.message, err);
						this.track.logger.error('cache invalid');
						this.track.logger.inspect(err);
						this.object.body = null;
						this.object.bodyChecksum = null;
						throw err;
					}
				}).fail((err) => {
					//clean up bad cache
					return this.cacheRemove().then(d.resolve, d.reject, d.notify);
				}).done();

				return d.promise;
			}

			// rtfm: https://www.mobify.com/blog/beginners-guide-to-http-cache-headers/
			private httpLoad(httpCache:boolean = true) {
				if (!this.cache.opts.remoteRead) {
					this.track.skip(CacheLoader.http_load);
					return Q().thenResolve();
				}
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, CacheLoader.http_load);

				// assemble request
				var req = HTTP.normalizeRequest(this.request.url);
				Object.keys(this.request.headers).forEach((key) => {
					req.headers[key] = String(this.request.headers[key]).toLowerCase();
				});

				// set cache headers
				if (this.object.info && this.object.body && httpCache) {
					if (this.object.info.httpETag) {
						req.headers['if-none-match'] = this.object.info.httpETag;
					}
					if (this.object.info.httpModified) {
						//TODO verify/fix date format
						//req.headers['if-modified-since'] = // not correct! new Date(this.object.info.httpModified);
					}
				}
				// we should always do always do this (fix in streaming update)
				//req.headers['accept-encoding'] = 'gzip, deflate';

				// cleanup
				req = HTTP.normalizeRequest(req);

				if (this.track.logEnabled) {
					this.track.logger.inspect(this.request);
					this.track.logger.inspect(req);
				}
				this.track.start(CacheLoader.http_load);

				d.notify('loading: ' + this.request.url);

				// do the actual request
				var httpPromise = HTTP.request(req).then((res:QioHTTP.Response) => {
					d.notify('status: ' + this.request.url + ' ' + String(res.status));

					if (this.track.logEnabled) {
						this.track.logger.status(this.request.url + ' ' + String(res.status));
						this.track.logger.inspect(res.headers);
					}

					this.object.response = new ResponseInfo();
					this.object.response.status = res.status;
					this.object.response.headers = res.headers;

					if (res.status < 200 || res.status >= 400) {
						this.track.error(CacheLoader.http_load);
						throw new Error('unexpected status code: ' + res.status + ' on ' + this.request.url);
					}
					if (res.status === 304) {
						if (!this.object.body) {
							throw new Error('flow error: http 304 but no local content on ' + this.request.url);
						}
						if (!this.object.info) {
							throw new Error('flow error: http 304 but no local info on ' + this.request.url);
						}
						//cache hit!
						this.track.event(CacheLoader.http_cache_hit);

						return this.cacheWrite(true);
					}

					if (!res.body) {
						// shouldn't we test
						throw new Error('flow error: http 304 but no local info on ' + this.request.url);
					}
					if (res.body && this.object.info && httpCache) {
						// we send cache headers but we got a body
						// meh!
					}

					return res.body.read().then((buffer:NodeBuffer) => {
						if (buffer.length === 0) {

						}
						var checksum = xm.sha1(buffer);

						if (this.object.info) {
							if (this.object.info.contentChecksum) {
								//xm.assert(checksum === this.object.info.contentChecksum, '{a} !== {b}', checksum, this.object.info.contentChecksum);
							}
							this.updateInfo(res, checksum);
						}
						else {
							this.copyInfo(res, checksum);
						}
						this.object.body = buffer;

						d.notify('complete: ' + this.request.url + ' ' + String(res.status));
						this.track.complete(CacheLoader.http_load);

						return this.cacheWrite(false).progress(d.notify);
					});
				}).then(() => {
					d.resolve();
				}, d.reject).done();

				return d.promise;
			}

			private cacheWrite(cacheWasFresh:boolean):Q.Promise<void> {
				if (!this.cache.opts.cacheWrite) {
					this.track.skip(CacheLoader.cache_write);
					return Q().thenResolve();
				}
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, CacheLoader.cache_write);

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
							this.track.event(CacheLoader.cache_write, 'written file to cache');
						}));
					}
					else {
						this.track.skip(CacheLoader.cache_write, 'cache was fresh');
					}
					write.push(xm.FileUtil.mkdirCheckQ(path.dirname(this.object.infoFile), true).then(() => {
						return FS.write(this.object.infoFile, info, {flags: 'wb'});
					}));
					// track em
					return Q.all(write).fail((err) => {
						this.track.error(CacheLoader.cache_write, 'file write', err);
						//TODO clean things up?
						throw err;
					}).then(() => {
						// ghost stat to fix weird empty file glitch (voodoo)
						return Q.all([
							FS.stat(this.object.bodyFile).then((stat) => {
								if (stat.size === 0) {
									this.track.error(CacheLoader.cache_write, 'written zero body bytes');
									d.notify(new Error('written zero body bytes'));
								}
							}),
							FS.stat(this.object.infoFile).then((stat) => {
								if (stat.size === 0) {
									this.track.error(CacheLoader.cache_write, 'written zero info bytes');
									d.notify(new Error('written zero info bytes'));
								}
							})
						]);
					});
				}).then(d.resolve, d.reject).done();

				return d.promise;
			}

			private cacheRemove():Q.Promise<void> {
				// maybe less strict check?
				if (!this.canUpdate()) {
					return Q.resolve(null);
				}
				return Q.all([
					this.removeFile(this.object.infoFile),
					this.removeFile(this.object.bodyFile),
				]).then(() => {
					this.track.event(CacheLoader.cache_remove, this.request.url);
				});
			}

			private copyInfo(res:QioHTTP.Response, checksum:string) {
				var info:CacheInfo = <CacheInfo>{};
				this.object.info = info;
				info.url = this.request.url;
				info.key = this.request.key;
				info.cacheCreated = getISOString(Date.now());
				this.updateInfo(res, checksum);
			}

			private updateInfo(res:QioHTTP.Response, checksum:string) {
				var info = this.object.info;
				info.contentType = res.headers['content-type'];
				info.httpETag = res.headers['etag'] || null;
				info.httpModified = getISOString((res.headers['last-modified'] ? new Date(res.headers['last-modified']) : new Date()));
				info.contentChecksum = checksum;
			}

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

			private readInfo():Q.Promise<void> {
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, CacheLoader.info_read);

				FS.isFile(this.object.infoFile).then((isFile) => {
					if (!isFile) {
						return null;
					}
					return FS.read(this.object.infoFile, {flags: 'rb'}).then((buffer:NodeBuffer) => {
						if (buffer.length === 0) {
							this.track.event(CacheLoader.local_info_empty, 'empty info file');
							return null;
						}
						return this.cache.infoKoder.decode(buffer).then((info:CacheInfo) => {
							//TODO do we need this test?
							xm.assert((info.url === this.request.url), 'info.url {a} is not {e}', info.url, this.request.url);
							this.object.info = info;
						}).fail((err) => {
							this.track.event(CacheLoader.local_info_malformed, 'mlaformed info file');
							throw err;
						});
					});
				}).then(() => {
					d.resolve();
				}, d.reject).done();
				return d.promise;
			}

			private removeFile(target:string):Q.Promise<void> {
				var d:Q.Deferred<void> = Q.defer();
				FS.exists(target).then((exists) => {
					if (!exists) {
						d.resolve();
						return;
					}
					return FS.isFile(target).then((isFile) => {
						if (!isFile) {
							throw new Error('not a file: ' + target);
						}
						this.track.event(CacheLoader.cache_remove, target);
						return FS.remove(target).then(() => {
							d.resolve();
						});
					});
				}).fail(d.reject).done();

				return d.promise;
			}

			toString():string {
				return this.request ? this.request.url : '<no request>';
			}
		}
	}
}
