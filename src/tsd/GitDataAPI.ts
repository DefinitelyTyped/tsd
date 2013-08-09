///<reference path="../_ref.ts" />
///<reference path="context/Context.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/io/hash.ts" />

module tsd {

	var _:UnderscoreStatic = require('underscore');
	var assert = require('assert');


	var asyncCB = (callback, ...args:any[]) => {
		process.nextTick(() => {
			callback.apply(null, args);
		})
	};

	export class GitCachedResult {

		private _key:string;
		private _label:any;
		private _data:any;
		private _lastSet:Date;

		constructor(label:String, key:string, data:any) {
			this._label = label;
			this._key = key;
			this.setData(data);
		}

		setData(data:any):void {
			this._data = data;
			this._lastSet = new Date();
		}

		toJSON():any {
			return {
				key: this.key,
				data: this.data,
				lastSet: this.lastSet.toUTCString()
			};
		}

		//TODO test this against toJSON()
		static fromJSON(json:any):GitCachedResult {
			assert.ok(json.label, 'json.label');
			assert.ok(json.key, 'json.key');
			assert.ok(json.data, 'json.data');
			assert.ok(json.lastSet, 'json.lastSet');
			var call = new GitCachedResult(json.label, json.key, json.data);
			call._lastSet = new Date(json.lastSet);
			return call;
		}

		getHash():string {
			return xm.sha1(this._key);
		}

		getStoreKey():string {
			return this._label + '_' + this.getHash();
		}

		get label():string {
			return this._label;
		}

		get key():string {
			return this._key;
		}

		get data():any {
			return this._data;
		}

		get lastSet():Date {
			return this._lastSet;
		}
	}

	export class GitCachedDataAPI {

		private _api:any;
		private _cache = new xm.KeyValueMap();

		stats = new xm.StatCounter();
		rate:GitRateLimitInfo;

		constructor(private _context:Context) {
			assert.ok(_context, 'context');

			var GitHubApi = require("github");
			this._api = new GitHubApi({
				version: "3.0.0"
			});

			this.rate = new GitRateLimitInfo(this._context.log);
		}

		getRepoParams(vars:any):any {
			return _.defaults(vars, {
				user: this._context.config.repoOwner,
				repo: this._context.config.repoProject
			});
		}

		hasCached(key:string):bool {
			return this._cache.has(key);
		}

		getCached(key:string):GitCachedResult {
			return this._cache.get(key);
		}

		getKey(label:string, keyTerms?:any):string {
			return xm.jsonToIdent([label, keyTerms ? keyTerms : {}]);
		}

		getBranches(finish:(err:any, index:any) => void):string {
			var params = this.getRepoParams({});
			return this.doCachedCall('getBranches', params, (callback) => {
				this._api.repos.getBranches(params, callback);
			}, finish);
		}

		getCommit(sha:string, finish:(err:any, index:any) => void):string {
			var params = this.getRepoParams({sha: sha});
			return this.doCachedCall('getCommit', params, (callback) => {
				this._api.repos.getCommit(params, callback);
			}, finish);
		}

		private doCachedCall(label:string, keyTerms:any, call:Function, callback:(err:any, index:any) => void):string {
			var key = this.getKey(label, keyTerms);
			var self:tsd.GitCachedDataAPI = this;

			self.stats.count('called');

			if (this._cache.has(key)) {
				self.stats.count('cache-hit');

				asyncCB(callback, null, this._cache.get(key).data);
				return key;
			}

			self.stats.count('cache-miss');

			call.call(this, (err:any, res:any) => {
				self.rate.getFromRes(res);

				if (err) {
					self.stats.count('call-error');
					callback(err, null);
				}
				else {
					self.stats.count('cache-set');
					// we got a keeper!
					self._cache.set(key, new GitCachedResult(label, key, res));
					callback(err, res);
				}
			});
			return key;
		}
	}

	export class GitRateLimitInfo {

		limit:number = 0;
		remaining:number = 0;
		lastUpdate:Date = new Date();

		constructor(public log:xm.Logger) {

		}

		getFromRes(response:any) {
			if (response && _.isObject(response.meta)) {
				if (response.meta.hasOwnProperty('x-ratelimit-limit')) {
					this.limit = parseInt(response.meta['x-ratelimit-limit']);
				}
				if (response.meta.hasOwnProperty('x-ratelimit-remaining')) {
					this.remaining = parseInt(response.meta['x-ratelimit-remaining']);
				}
				this.lastUpdate = new Date();
				if (this.log) {
					this.log.debug('rate limit: ' + this.remaining + ' of ' + this.limit);
				}
			}
		}

		hasRemaining():bool {
			return this.remaining > 0;
		}
	}
}