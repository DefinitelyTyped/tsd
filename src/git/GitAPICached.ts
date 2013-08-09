///<reference path="../_ref.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/io/hash.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="GitAPICachedJSONStore.ts" />
///<reference path="GitAPICachedResult.ts" />

module git {

	var async:Async = require('async');
	var _:UnderscoreStatic = require('underscore');
	var assert = require('assert');
	var mkdirp = require('mkdirp');
	var fs = require('fs');
	var path = require('path');

	export class GitAPICached {

		private _api:any;
		private _cache = new xm.KeyValueMap();
		private _repoOwner:string;
		private _projectName:string;
		private _version:string = "3.0.0";
		private _store;
		private _defaultOpts:any = {
			readCache: true,
			writeCache: true,
			readStore: true,
			writeStore: true
		};

		stats = new xm.StatCounter(false);
		rate:GitRateLimitInfo;

		constructor(repoOwner:string, projectName:string, storeFolder:string) {
			assert.ok(repoOwner, 'expected repoOwner argument');
			assert.ok(projectName, 'expected projectName argument');
			assert.ok(storeFolder, 'expected storeFolder argument');

			this._repoOwner = repoOwner;
			this._projectName = projectName;
			this._store = new GitAPICachedJSONStore(this, path.join(storeFolder, 'git_api_cache'));

			var GitHubApi = require("github");
			this._api = new GitHubApi({
				version: this._version
			});
			this.rate = new GitRateLimitInfo();
		}

		getRepoParams(vars:any):any {
			return _.defaults(vars, {
				user: this._repoOwner,
				repo: this._projectName
			});
		}

		getCachedRaw(key:string, callback:(err, res:GitAPICachedResult) => void):void {
			var self:git.GitAPICached = this;
			if (self._cache.has(key)){
				xm.callAsync(callback, null, self._cache.get(key));
				return;
			}
			self._store.getResult(key, (err, res) => {
				return callback(err, res);
			});
		}

		getKey(label:string, keyTerms?:any):string {
			return xm.jsonToIdent([label, keyTerms ? keyTerms : {}]);
		}

		getBranch(branch:string, callback:(err:any, index:any) => void):string {
			var params = this.getRepoParams({
				branch: branch
			});
			return this.doCachedCall('getBranch', params, {}, (cb) => {
				this._api.repos.getBranch(params, cb);
			}, callback);
		}

		getBranches(callback:(err, index:any) => void):string {
			var params = this.getRepoParams({});

			return this.doCachedCall('getBranches', params, {}, (cb) => {
				this._api.repos.getBranches(params, cb);
			}, callback);
		}

		getCommit(sha:string, finish:(err, index:any) => void):string {
			var params = this.getRepoParams({
				sha: sha
			});
			return this.doCachedCall('getCommit', params, {}, (cb) => {
				this._api.repos.getCommit(params, cb);
			}, finish);
		}

		private doCachedCall(label:string, keyTerms:any, opts:any, call:Function, callback:(err, index:any) => void):string {
			var key = this.getKey(label, keyTerms);
			var self:git.GitAPICached = this;
			opts = _.defaults(opts || {}, self._defaultOpts);

			self.stats.count('called');

			// in memory cache?
			if (opts.readCache) {
				if (this._cache.has(key)) {
					self.stats.count('cache-hit');

					xm.callAsync(callback, null, this._cache.get(key).data);
					return key;
				}
				self.stats.count('cache-miss');
			}
			else {
				self.stats.count('cache-get-skip');
			}

			// subroutine
			var execCall = () => {
				self.stats.count('call-api');

				// set scope!
				call.call(this, (err, res:any) => {
					self.rate.getFromRes(res);

					if (err) {
						self.stats.count('call-error');
						return callback(err, null);
					}
					self.stats.count('call-success');

					var cached = new GitAPICachedResult(label, key, res);

					// memory storage?
					if (opts.writeCache) {
						self._cache.set(key, cached);
						self.stats.count('cache-set');
					}
					else {
						self.stats.count('cache-set-skip');
					}

					// permanent storage?
					if (opts.writeStore) {
						self._store.storeResult(cached, (err, info) => {
							if (err) {
								console.log(err);
								self.stats.count('store-set-error');
								return callback(err, null);
							}
							self.stats.count('store-set');
							callback(err, res);
						});
					}
					else {
						self.stats.count('store-set-skip');
						callback(err, res);
					}
				});
			};

			// in permanent store?
			if (opts.readStore) {
				self._store.getResult(key, (err, res) => {
					if (err) {
						self.stats.count('store-get-error');
						return callback(err, null);
					}
					if (res) {
						self.stats.count('store-hit');
						return callback(null, res);
					}
					self.stats.count('store-miss');

					execCall();
				});
			}
			else {
				self.stats.count('store-get-skip');
				execCall();
			}
			return key;
		}

		getCacheKey():string {
			return this._repoOwner + '-' + this._projectName + '-v' + this._version;
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