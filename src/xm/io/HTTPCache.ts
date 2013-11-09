///<reference path="../../_ref.d.ts" />
///<reference path="../ObjectUtil.ts" />
///<reference path="../promise.ts" />
///<reference path="../EventLog.ts" />
///<reference path="../hash.ts" />
///<reference path="FileUtil.ts" />
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
	var FS:typeof QioFS = require('q-io/fs');
	var HTTP:typeof QioHTTP = require('q-io/http');
	var tv4:TV4 = require('tv4');

	export module http {
		export class CacheAccess {
			//is now HTTPCacheOpts (below)
		}

		export class HTTPCacheObject {
			request:HTTPRequest;
			storeDir:string;

			infoFile:string;
			info:HTTPCacheInfo;

			bodyFile:string;
			bodyChecksum:string;
			body:NodeBuffer;

			constructor(request:HTTPRequest) {
				this.request = request;
			}
		}

		export interface HTTPCacheInfo {
			url:string;
			key:string;
			contentType:string;
			httpETag:string;
			httpModified:string;
			cacheCreated:string;
			contentChecksum:string;
		}

		var typeString = {'type': 'string'};
		var typeObject = {'type': 'object'};

		export var infoSchema = {
			type: 'object',
			properties: {
				url: typeString,
				contentType: typeString,
				httpETag: typeString,
				httpModified: typeString,
				cacheCreated: typeString,
				contentChecksum: typeString
			}
		};
		export enum HTTPCacheMode {
			forceLocal,
			forceRemote,
			forceUpdate,
			allowRemote,
			allowUpdate
		}

		export class HTTPCacheOpts {
			compressStore:boolean = false;
			splitKeyDir:number = 0;
			cacheRead = true;
			cacheWrite = true;
			remoteRead = true;

			constructor (mode?:HTTPCacheMode) {
				if (mode) {
					this.applyCacheMode(mode);
				}
			}

			//set modes for fixture updates
			applyCacheMode(mode:HTTPCacheMode) {
				switch (mode) {
					case HTTPCacheMode.forceRemote:
						this.cacheRead = false;
						this.remoteRead = true;
						this.cacheWrite = false;
						break;
					case HTTPCacheMode.forceUpdate:
						this.cacheRead = false;
						this.remoteRead = true;
						this.cacheWrite = true;
						break;
					case HTTPCacheMode.allowUpdate:
						this.cacheRead = true;
						this.remoteRead = true;
						this.cacheWrite = true;
						break;
					case HTTPCacheMode.allowRemote:
						this.cacheRead = true;
						this.remoteRead = true;
						this.cacheWrite = false;
						break;
					case HTTPCacheMode.forceLocal:
					default:
						this.cacheRead = true;
						this.remoteRead = false;
						this.cacheWrite = false;
						break;
				}
			}
		}

		export class HTTPCache {
			storeDir:string;
			jobs = new xm.KeyValueMap<xm.http.HTTPLoadJob>();
			opts:HTTPCacheOpts;
			track:xm.EventLog;
			infoKoder:IContentKoder<HTTPCacheInfo>;
			tv4:TV4;

			constructor(storeDir:string, opts?:HTTPCacheOpts) {
				xm.assertVar(storeDir, 'string', 'storeDir');
				xm.assertVar(opts, HTTPCacheOpts, 'opts', true);

				this.storeDir = storeDir;
				this.opts = (opts || new HTTPCacheOpts());
				this.track = new xm.EventLog('http_cache', 'HTTPCache');

				this.tv4 = tv4.freshApi();
				this.infoKoder = new JSONKoder<HTTPCacheInfo>(infoSchema);
			}

			getObject(request:HTTPRequest):Q.Promise<HTTPCacheObject> {
				xm.assert(request.locked, 'request must be lock()-ed {a}', request.url);

				var d:Q.Deferred<HTTPCacheObject> = Q.defer();
				this.track.promise(d.promise, 'get');

				this.init().then(() => {
					var job;
					if (this.jobs.has(request.key)) {
						job = this.jobs.get(request.key);
					}
					else {
						job = new HTTPLoadJob(this, request);
						this.jobs.set(request.key, job);
					}
					return job.getObject().then(d.resolve);
				}).fail(d.reject).done();

				return d.promise;
			}

			private init():Q.Promise<void> {
				var defer:Q.Deferred<void> = Q.defer();
				this.track.promise(defer.promise, 'init');

				FS.exists(this.storeDir).then((exists:boolean) => {
					if (!exists) {
						this.track.event('dir_create', this.storeDir);
						return xm.FileUtil.mkdirCheckQ(this.storeDir, true);
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

		export class HTTPRequest {
			key:string;

			url:string;
			headers:any;
			ext:string;

			locked:boolean;

			constructor(url:string, headers:any, ext:string = 'raw') {
				this.url = url;
				this.headers = headers;
				this.ext = ext;
				Object.defineProperty(this, 'locked', {writable: false});
			}

			lock():HTTPRequest {
				if (!this.locked) {
					return;
				}
				Object.defineProperty(this, 'locked', {writable: true});
				this.locked = true;
				this.key = xm.jsonToIdentHash({
					url: this.url,
					ext: this.ext,
					headers: this.headers
				});
				xm.ObjectUtil.lockProps(this, ['key', 'url', 'headers', 'ext', 'locked']);
				xm.ObjectUtil.deepFreeze(this.headers);
				return this;
			}
		}

		export interface IContentKoder<T> {
			decode(content:NodeBuffer):Q.Promise<T>;
			encode(value:T):Q.Promise<NodeBuffer>;
			ext:string;
		}

		export class UTFKoder implements IContentKoder<String> {
			ext:string = '.txt';

			decode(content:NodeBuffer):Q.Promise<String> {
				return Q().then(() => {
					if (!xm.isValid(content)) {
						throw new Error('undefined content');
					}
					return content.toString('utf8');
				});
			}

			encode(value:string):Q.Promise<NodeBuffer> {
				return Q().then(() => {
					if (!xm.isValid(value)) {
						throw new Error('undefined content');
					}
					return new Buffer(value, 'utf8');
				});
			}

			static main = new UTFKoder();
		}

		export class ByteKoder<NodeBuffer> implements IContentKoder<NodeBuffer> {
			ext:string = '.raw';

			decode(content:NodeBuffer):Q.Promise<NodeBuffer> {
				return Q().then(() => {
					if (!xm.isValid(content)) {
						throw new Error('undefined content');
					}
					return content;
				});
			}

			encode(value:NodeBuffer):Q.Promise<NodeBuffer> {
				return Q().then(() => {
					if (!xm.isValid(value)) {
						throw new Error('undefined content');
					}
					return value;
				});
			}

			static main = new ByteKoder();
		}

		export class JSONKoder<T> implements IContentKoder<T> {
			schema:any;
			ext:string = '.json';

			constructor(schema?) {
				this.schema = schema;
			}

			decode(content:NodeBuffer):Q.Promise<T> {
				return Q().then(() => {
					if (!xm.isValid(content)) {
						throw new Error('undefined content');
					}
					return JSON.parse(content.toString('utf8'));
				}).then((value:T) => {
					this.assert(value);
					return value;
				});
			}

			assert(value:T):void {
				if (this.schema) {
					//validate schema
					var res:TV4SingleResult = tv4.validateResult(value, this.schema);
					if (!res.valid || res.missing.length > 0) {
						//TODO get better errors
						throw new Error('object not in schema: ' + (res.error ? res.error.message : '<no message>'));
						//return null;
					}
				}
			}

			encode(value:T):Q.Promise<NodeBuffer> {
				return Q().then(() => {
					if (!xm.isValid(value)) {
						throw new Error('undefined content');
					}
					this.assert(value);
					return new Buffer(JSON.stringify(value, null, 2), 'utf8');
				});
			}

			static main = new JSONKoder<any>();
		}

		export interface IObjectValidator {
			assert(object:HTTPCacheObject):boolean
		}

		export class SimpleValidator implements IObjectValidator {
			assert(object:HTTPCacheObject):boolean {
				xm.assert(xm.isValid(object.body), 'body valid');
				return true;
			}

			static main = new SimpleValidator();
		}

		export class ChecksumValidator implements IObjectValidator {
			assert(object:HTTPCacheObject):boolean {
				xm.assert(xm.isValid(object.body), 'body valid');
				xm.assertVar(object.bodyChecksum, 'sha', 'bodyChecksum');
				xm.assertVar(object.info.contentChecksum, 'sha', 'contentChecksum');
				xm.assert(object.info.contentChecksum === object.bodyChecksum, 'checksum', object.info.contentChecksum, object.bodyChecksum);
				return true;
			}

			static main = new ChecksumValidator();
		}

		export class HTTPLoadJob {

			static get_object:string = 'get_object';
			static cache_read:string = 'cache_read';
			static cache_write:string = 'cache_write';
			static http_load:string = 'http_load';
			static info_read:string = 'info_read';

			cache:HTTPCache;
			request:HTTPRequest;
			object:HTTPCacheObject;
			cacheValidator:IObjectValidator;
			loadValidator:IObjectValidator;
			track:xm.EventLog;

			private _defer:Q.Deferred<HTTPCacheObject>;

			constructor(cache:HTTPCache, request:HTTPRequest) {
				this.cache = cache;
				this.request = request;
				this.cacheValidator = ChecksumValidator.main;
				this.loadValidator = ChecksumValidator.main;

				this.object = new HTTPCacheObject(request);
				//TODO apply cache opts (splitKeyDir)
				//this.object.storeDir = path.join(this.cache.storeDir, this.request.key.charAt(0), this.request.key.charAt(1));
				this.object.storeDir = this.cache.storeDir;
				this.object.infoFile = path.join(this.object.storeDir, this.request.key + this.request.ext + '.json');
				this.object.bodyFile = path.join(this.object.storeDir, this.request.key + this.request.ext);

				this.track = new xm.EventLog('http_load', this.request.url);

				xm.ObjectUtil.lockProps(this, ['cache', 'request', 'object']);
			}

			config(cacheValidator?:IObjectValidator, loadValidator?:IObjectValidator):HTTPLoadJob {
				this.cacheValidator = (cacheValidator || this.cacheValidator);
				this.loadValidator = (loadValidator || this.loadValidator);

				return this;
			}

			getObject():Q.Promise<HTTPCacheObject> {
				//main cache/load flow, the clousure  is only called when no matching keyTerm was found (or cache was locked)
				if (this._defer) {
					this.track.skip(HTTPLoadJob.get_object);
					return this._defer.promise;
				}

				this._defer = Q.defer();
				this.track.promise(this._defer.promise, HTTPLoadJob.get_object);

				var cleanup = () => {
					this._defer = null;
				};

				//main logic flow
				this.cacheRead().then(() => {
					try {
						this.cacheValidator.assert(this.object);
						//valid local cache hit
						this._defer.resolve(this.object);
						return;
					}
					catch (err) {
						this.track.logger.inspect(err);
						this.object.body = null;
						this.object.bodyChecksum = null;
					}

					return this.httpLoad(true).then(() => {
						if (!xm.isValid(this.object.body)) {
							throw new Error('no result body: ' + this.object.request.url);
						}
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
					this.track.skip(HTTPLoadJob.cache_read);
					return Q().thenResolve();
				}
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, HTTPLoadJob.cache_read);

				this.readInfo().then(() => {
					if (!this.object.info) {
						//TODO add auto-clean options
						return null;
					}

					return FS.read(this.object.bodyFile, {flags: 'rb'}).then((reader:Qio.Reader) => {
						var buffer = reader.read();
						reader.close();
						if (buffer.length === 0) {
							return null;
						}
						this.object.bodyChecksum = xm.sha1(buffer);
						this.object.body = buffer;
					});
				}).then(() => {
					d.resolve();
				}, d.reject).done();

				return d.promise;
			}

			private readInfo():Q.Promise<void> {
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, HTTPLoadJob.info_read);

				FS.isFile(this.object.infoFile).then((isFile) => {
					if (!isFile) {
						return null;
					}
					return FS.read(this.object.infoFile, {flags: 'rb'}).then((reader:Qio.Reader) => {
						var buffer = reader.read();
						reader.close();
						if (buffer.length === 0) {
							return null;
						}
						return this.cache.infoKoder.decode(buffer).then((info:HTTPCacheInfo) => {
							//TODO do we need this test?
							xm.assert((info.url !== this.request.url), 'info.url {a} is not {e}', info.url);
							this.object.info = info;
							//TODO add auto-clean options
						});
					});
				}).then(() => {
					d.resolve();
				}, d.reject).done();
				return d.promise;
			}

			private httpLoad(httpCache:boolean) {
				if (!this.cache.opts.remoteRead) {
					this.track.skip(HTTPLoadJob.http_load);
					return Q().thenResolve();
				}
				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, HTTPLoadJob.http_load);

				var req = HTTP.normalizeRequest(this.request.url);
				Object.keys(this.request.headers).forEach((key) => {
					req.headers[key] = this.request.headers[key];
				});
				//TODO add cache headers
				if (this.object.info) {

				}
				else {

				}

				this.track.start(HTTPLoadJob.http_load);

				var httpPromise = HTTP.request(req).then((res:QioHTTP.Response) => {
					this.track.status(HTTPLoadJob.http_load, String(res.status));

					if (this.track.logEnabled) {
						this.track.logger.inspect(res, 1, 'res');
					}
					if (res.status < 200 || res.status >= 400) {
						this.track.error(HTTPLoadJob.http_load);
						throw new Error('unexpected status code: ' + res.status);
					}
					if (res.status === 304) {
						if (!this.object.body) {
							throw new Error('flow error: http 304 but no local content');
						}
						if (!this.object.info) {
							throw new Error('flow error: http 304 but no local info');
						}
						this.updateInfo(res, checksum);

						return;
					}

					var buffer = res.body.read();
					var checksum = xm.sha1(buffer);

					if (this.object.info) {
						//possible?
						if (this.object.info.contentChecksum) {
							//xm.assert(checksum === this.object.info.contentChecksum, '{a} !== {b}', checksum, this.object.info.contentChecksum);
						}
						this.updateInfo(res, checksum);
					}
					else {
						this.copyInfo(res, checksum);
					}
					this.object.body = buffer;

					this.track.complete(HTTPLoadJob.http_load);

					return this.cacheWrite(buffer).then(d.resolve, d.reject);
					// 304
				}).done();

				return d.promise;
			}

			private copyInfo(res:QioHTTP.Response, checksum:string) {
				var info:HTTPCacheInfo = <HTTPCacheInfo>{};
				this.object.info = info;
				info.url = this.request.url;
				info.key = this.request.key;
				info.contentType = res.headers['Content-Type'] || null;
				info.httpETag = res.headers['E-Tag'] || null;
				info.httpModified = res.headers['Last-Modified'] || null;
				info.cacheCreated = new Date().toISOString();
				info.contentChecksum = checksum;
				//tODO validate against schema (later at save)
			}

			private updateInfo(res:QioHTTP.Response, checksum:string) {
				var info = this.object.info;
				info.contentType = res.headers['Content-Type'] || null;
				info.httpETag = res.headers['E-Tag'] || null;
				info.httpModified = res.headers['Last-Modified'] || null;
				info.contentChecksum = checksum;
			}

			private cacheWrite(buffer:NodeBuffer):Q.Promise<void> {
				if (!this.cache.opts.cacheWrite) {
					this.track.skip(HTTPLoadJob.cache_write);
					return Q().thenResolve();
				}

				var d:Q.Deferred<void> = Q.defer();
				this.track.promise(d.promise, HTTPLoadJob.cache_write);

				this.cache.infoKoder.encode(this.object.info).then((info:NodeBuffer) => {
					return Q.all([
						FS.write(this.object.infoFile, info, {flags: 'wb'}),
						FS.write(this.object.bodyFile, buffer, {flags: 'wb'})
					]).fail((err) => {
						this.track.error(HTTPLoadJob.cache_write, 'file write', err);
						//TODO clean things up?
						throw err;
					});
				}).then(d.resolve, d.reject).done();

				return d.promise;
			}
		}
	}
}
