///<reference path="../../_ref.d.ts" />
///<reference path="../KeyValueMap.ts" />
///<reference path="../StatCounter.ts" />
///<reference path="../assertVar.ts" />
///<reference path="../ObjectUtil.ts" />
///<reference path="hash.ts" />
///<reference path="../Logger.ts" />
///<reference path="FileUtil.ts" />
///<reference path="CachedJSONValue.ts" />
///<reference path="CachedJSONStore.ts" />

module xm {
	'use strict';

	var _ = require('underscore');
	var Q:typeof Q = require('q');
	var fs = require('fs');
	var path = require('path');

	export class CachedLoaderOptions {
		cacheRead = true;
		cacheWrite = true;
		remoteRead = true;
	}

	export interface CachedLoaderService<T> {
		getValue(key:string, opts?):Q.Promise<T>;
		writeValue(key:string, label:string, value, opts?):Q.Promise<T>;

		//TODO do we need this?
		getKeys(opts?):Q.Promise<string[]>;
	}
	/*
	 CachedLoader: abstraction to execute and cache results of remote calls

	 with many counters for easy debugging and stats
	 */
	//TODO consider adding a lingering active-list option to keep files in memory
	export class CachedLoader<T> {
		private _debug:boolean = false;
		private _options:any = new xm.CachedLoaderOptions();
		private _active:xm.IKeyValueMap<Q.Promise<xm.CachedJSONValue>> = new xm.KeyValueMap();
		private _service:xm.CachedLoaderService<T> = null;

		//TODO upgrade log to event tracker
		stats = new xm.StatCounter();

		constructor(label:string, service:CachedLoaderService<T>) {
			xm.assertVar(label, 'string', 'label');
			xm.assertVar(service, 'object', 'service');

			this._service = service;
			this.stats.logger = xm.getLogger(label + '.CachedLoader');

			xm.ObjectUtil.hidePrefixed(this);
		}

		getKey(label:string, keyTerms?:any):string {
			//TODO replace with: return xm.jsonToIdent(keyTerms ? [label, keyTerms] : [label]);
			return xm.jsonToIdent([label, keyTerms ? keyTerms : {}]);
		}

		//main cache/load flow, the clousure  is only called when no matching keyTerm was found (or cache was locked)
		doCachedCall(label:string, keyTerms:any, opts:any, cachedCall:() => Q.Promise<T>):Q.Promise<T> {
			var d:Q.Deferred<T> = Q.defer();

			var key = xm.isString(keyTerms) ? keyTerms : this.getKey(label, keyTerms);

			opts = _.defaults(opts || {}, this._options);

			this.stats.count('start', label);

			if (this._debug) {
				xm.log.debug(opts);
				xm.log.debug(key);
			}

			if (this._active.has(key)) {
				this.stats.count('active-hit', label);

				this._active.get(key).then((content:T) => {
					this.stats.count('active-resolve', label);
					d.resolve(content);
				}, (err) => {
					this.stats.count('active-error', label);
					//rethrow
					d.reject(err);
				});

				return d.promise;
			}

			var cleanup = () => {
				this.stats.count('active-remove', label);
				this._active.remove(key);
			};

			//main logic flow
			this.cacheRead(opts, label, key).then((res) => {
				if (!xm.isNull(res) && !xm.isUndefined(res)) {
					this.stats.count('cache-hit', label);
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
			}).then((res:T) => {
				cleanup();
				this.stats.count('complete', label);
				d.resolve(res);

			}, (err) => {
				cleanup();
				this.stats.count('error', label);
				xm.log.error(err);
				//not return res?
				d.reject(err);
			});

			//cache promise while we are loading
			this.stats.count('active-set', label);
			this._active.set(key, d.promise);

			return d.promise;
		}

		private cacheRead(opts:xm.CachedLoaderOptions, label:string, key:string):Q.Promise<T> {
			var d:Q.Deferred<T> = Q.defer();

			if (opts.cacheRead) {
				this.stats.count('read-start', label);
				this._service.getValue(key).then((res:any) => {
					if (xm.isNull(res) || xm.isUndefined(res)) {
						this.stats.count('read-miss', label);

						d.resolve(null);
					}
					else {
						this.stats.count('read-hit', label);
						d.resolve(res);
					}
				}, (err) => {
					this.stats.count('read-error', label);
					xm.log.error(err);
					d.reject(err);
				});
			}
			else {
				this.stats.count('read-skip', label);
				d.resolve(null);
			}
			return d.promise;
		}

		private callLoad(opts:xm.CachedLoaderOptions, label:string, cachedCall:() => Q.Promise<T>) {
			var d:Q.Deferred<T> = Q.defer();

			if (opts.remoteRead) {
				this.stats.count('load-start', label);

				Q(cachedCall()).then((res) => {
					this.stats.count('load-success', label);
					d.resolve(res);
				}, (err) => {
					this.stats.count('load-error', label);
					xm.log.error(err);
					d.reject(err);
				});
			}
			else {
				this.stats.count('load-skip', label);
				d.resolve(null);
			}
			return d.promise;
		}

		private cacheWrite(opts:xm.CachedLoaderOptions, label:string, key:string, value):Q.Promise<T> {
			var d:Q.Deferred<T> = Q.defer();

			if (opts.cacheWrite) {
				this.stats.count('write-start', label);

				this._service.writeValue(key, label, value).then((info) => {
					this.stats.count('write-success', label);
					d.resolve(value);
				}, (err) => {
					this.stats.count('write-error', label);
					xm.log.error(err);
					d.reject(err);
				});
			}
			else {
				this.stats.count('write-skip', label);
				d.resolve(null);
			}
			return d.promise;
		}

		get options():CachedLoaderOptions {
			return this._options;
		}

		get debug():boolean {
			return this._debug;
		}

		set debug(value:boolean) {
			this._debug = value;
			this.stats.log = value;
		}
	}
}
