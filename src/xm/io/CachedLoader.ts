///<reference path="../../_ref.ts" />
///<reference path="../KeyValueMap.ts" />
///<reference path="../StatCounter.ts" />
///<reference path="../assertVar.ts" />
///<reference path="../ObjectUtil.ts" />
///<reference path="hash.ts" />
///<reference path="Logger.ts" />
///<reference path="FileUtil.ts" />
///<reference path="CachedJSONValue.ts" />
///<reference path="CachedJSONStore.ts" />

module xm {

	var _:UnderscoreStatic = require('underscore');
	var Q:QStatic = require('q');
	var fs = require('fs');
	var path = require('path');

	export class CachedLoaderOptions {
		cacheRead = true;
		cacheWrite = true;
		remoteRead = true;

		modeUpdate() {
			this.cacheRead = false;
			this.remoteRead = true;
			this.cacheWrite = true;
		}

		modeCached() {
			this.cacheRead = true;
			this.remoteRead = false;
			this.cacheWrite = false;
		}

		modeRemote() {
			this.cacheRead = false;
			this.remoteRead = true;
			this.cacheWrite = false;
		}

		modeAll() {
			this.cacheRead = true;
			this.remoteRead = true;
			this.cacheWrite = true;
		}

		modeBlock() {
			this.cacheRead = false;
			this.remoteRead = false;
			this.cacheWrite = false;
		}
	}

	export interface CachedLoaderService {
		getValue(key:string, opts?):Qpromise;
		writeValue(key:string, label:string, value, opts?):Qpromise;
		getKeys(opts?):Qpromise;
	}
	/*
	 CachedLoader: abstraction to execute and cache results of remote calls

	 with many counters for easy debugging and stats
	 */
	//TODO consider adding a lingering active-list option to keep files in memory
	export class CachedLoader {
		private _debug:bool = false;
		private _options:any = new xm.CachedLoaderOptions();
		private _active:xm.KeyValueMap = new xm.KeyValueMap();
		private _service:xm.CachedLoaderService = null;

		stats = new xm.StatCounter();

		constructor(name:string, service:CachedLoaderService) {
			xm.assertVar('label', name, 'string');
			xm.assertVar('service', service, 'object');
			this._service = service;
			this.stats.logger = xm.getLogger(name + '.CachedLoader');

			xm.ObjectUtil.hidePrefixed(this);
		}

		getKey(label:string, keyTerms?:any):string {
			return xm.jsonToIdent([label, keyTerms ? keyTerms : {}]);
		}

		doCachedCall(label:string, keyTerms:any, opts:any, cachedCall:() => Qpromise):Qpromise {
			var key = xm.isString(keyTerms) ? keyTerms : this.getKey(label, keyTerms);

			opts = _.defaults(opts || {}, this._options);

			this.stats.count('start', label);

			if (this._debug) {
				xm.log(opts);
				xm.log(key);
			}

			//reuse promise if we are already getting this file
			if (this._active.has(key)) {
				this.stats.count('active-hit');

				return this._active.get(key).then((content) => {
					this.stats.count('active-resolve');
					return content;
				}, (err) => {
					this.stats.count('active-error');
					//rethrow
					throw err;
				});
			}

			var cleanup = () => {
				this.stats.count('active-remove');
				this._active.remove(key);
			};

			//main logic flow
			var promise = this.cacheRead(opts, label, key).then((res) => {
				if (!xm.isNull(res) && !xm.isUndefined(res)) {
					this.stats.count('cache-hit');
					return res;
				}
				return this.callLoad(opts, label, cachedCall).then((res) => {
					if (xm.isNull(res) || xm.isUndefined(res)) {
						this.stats.count('call-empty');
						throw new Error('no result for: ' + label);
						//return null;
					}
					return this.cacheWrite(opts, label, key, res).thenResolve(res);
				});
			}).then((res) => {
				cleanup();
				this.stats.count('complete', label);
				return res;
			}, (err) => {
				cleanup();
				this.stats.count('error', label);
				xm.log.error(err);
				//not return res?
				throw(err);
			});

			//cache promise while we are loading
			this.stats.count('active-set');
			this._active.set(key, promise);
			return promise;
		}

		private cacheRead(opts:xm.CachedLoaderOptions, label:string, key:string):Qpromise {
			if (opts.cacheRead) {
				this.stats.count('read-start', label);
				return this._service.getValue(key).then((res:any) => {
					if (xm.isNull(res) || xm.isUndefined(res)) {
						this.stats.count('read-miss', label);

						// it is valid to get empty content
						return null;
					}
					else {
						this.stats.count('read-hit', label);
						return res;
					}
				}, (err) => {
					this.stats.count('read-error', label);
					xm.log.error(err);
					throw (err);
				});
			}
			this.stats.count('read-skip', label);
			return Q(null);
		}

		private callLoad(opts:xm.CachedLoaderOptions, label:string, cachedCall:() => Qpromise) {
			if (opts.remoteRead) {
				this.stats.count('load-start', label);

				return Q(cachedCall()).then((res) => {
					this.stats.count('load-success', label);
					return res;
				}, (err) => {
					this.stats.count('load-error', label);
					xm.log.error(err);
					throw(err);
				});
			}
			this.stats.count('load-skip', label);
			return Q(null);
		}

		private cacheWrite(opts:xm.CachedLoaderOptions, label:string, key:string, value):Qpromise {
			if (opts.cacheWrite) {
				this.stats.count('write-start', label);

				return this._service.writeValue(key, label, value).then((info) => {
					this.stats.count('write-success', label);
					return value;
				}, (err) => {
					this.stats.count('write-error', label);
					xm.log.error(err);
					throw (err);
				});
			}
			this.stats.count('write-skip', label);
			return Q(value);
		}

		get options():CachedLoaderOptions {
			return this._options;
		}

		get debug():bool {
			return this._debug;
		}

		set debug(value:bool) {
			this._debug = value;
			this.stats.log = value;
		}
	}
}