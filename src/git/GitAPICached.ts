///<reference path="../_ref.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/io/hash.ts" />
///<reference path="../xm/io/Logger.ts" />

module git {

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
			assert.ok(label, 'label');
			assert.ok(key, 'key');
			assert.ok(data, 'data');

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
				label: this.label,
				lastSet: this.lastSet.getTime()
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

	export class GitAPICached {

		private _api:any;
		private _cache = new xm.KeyValueMap();
		private _repoOwner:string;
		private _projectName:string;

		stats = new xm.StatCounter();
		rate:GitRateLimitInfo;

		constructor(repoOwner:string, projectName:string) {
			assert.ok(repoOwner, 'expected repoOwner argument');
			assert.ok(projectName, 'expected projectName argument');

			this._repoOwner = repoOwner;
			this._projectName = projectName;

			var GitHubApi = require("github");
			this._api = new GitHubApi({
				version: "3.0.0"
			});
			this.rate = new GitRateLimitInfo();
		}

		getRepoParams(vars:any):any {
			return _.defaults(vars, {
				user: this._repoOwner,
				repo: this._projectName
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

		getBranch(branch:string, finish:(err:any, index:any) => void):string {
			var params = this.getRepoParams({branch: branch});
			return this.doCachedCall('getBranch', params, (callback) => {
				this._api.repos.getCommit(params, callback);
			}, finish);
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
			var self:git.GitAPICached = this;

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

		constructor() {

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
			}
		}

		toStatus():string {
			return 'rate limit: ' + this.remaining + ' of ' + this.limit + ' @ ' + this.lastUpdate.toLocaleString();
		}

		hasRemaining():bool {
			return this.remaining > 0;
		}
	}
}