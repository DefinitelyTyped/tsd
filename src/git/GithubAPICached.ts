///<reference path="../_ref.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="../xm/io/hash.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="GithubAPICachedJSONStore.ts" />
///<reference path="GithubAPICachedResult.ts" />
///<reference path="GithubRepo.ts" />

module git {

	var async:Async = require('async');
	var _:UnderscoreStatic = require('underscore');
	var assert = require('assert');
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');

	var Github = require('github');

	export interface GithubJS {
		repos:git.GithubJSRepos;
		gitdata:git.GithubJSData;
	}
	export interface GithubJSRepos {
		getBranches(params:any, calback:git.GithubJSCallback);
		getBranch(params:any, calback:git.GithubJSCallback);
		getCommits(params:any, calback:git.GithubJSCallback);
	}
	export interface GithubJSData {
		getCommit(params:any, calback:git.GithubJSCallback);
		getTree(params:any, calback:git.GithubJSCallback);
		getBlob(params:any, calback:git.GithubJSCallback);
	}
	export interface GithubJSCallback {
		(err?:any, res?:any):void;
	}

	export class GithubAPICached {

		private _api:git.GithubJS;
		private _cache:xm.IKeyValueMap;
		private _repo:GithubRepo;
		private _version:string = '3.0.0';
		private _store:GithubAPICachedJSONStore;
		private _defaultOpts:any = {
			cacheGet: true,
			cacheSet: true,
			storeGet: true,
			storeSet: true
		};

		private _debug:bool = false;
		stats = new xm.StatCounter(false);
		rate:GitRateLimitInfo;

		constructor(repo:GithubRepo, storeFolder:string) {
			xm.assertVar('repo', repo, GithubRepo);
			xm.assertVar('storeFolder', storeFolder, 'string');

			this._repo = repo;
			this._api = <git.GithubJS> new Github({
				version: this._version
			});

			this._cache = new xm.KeyValueMap();
			this._store = new git.GithubAPICachedJSONStore(this, storeFolder);
			this.rate = new GitRateLimitInfo();
		}

		getRepoParams(vars:any):any {
			return _.defaults(vars, {
				user: this._repo.ownerName,
				repo: this._repo.projectName
			});
		}

		getCachedRaw(key:string, callback:(err, res:GithubAPICachedResult) => void):void {
			var self:git.GithubAPICached = this;
			if (self._cache.has(key)) {
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

		getBranches(callback:(err, data:any) => void):string {
			var params = this.getRepoParams({});
			return this.doCachedCall('getBranches', params, {}, (cb) => {
				this._api.repos.getBranches(params, cb);
			}, callback);
		}

		getBranch(branch:string, callback:(err:any, data:any) => void):string {
			var params = this.getRepoParams({
				branch: branch
			});
			return this.doCachedCall('getBranch', params, {}, (cb) => {
				this._api.repos.getBranch(params, cb);
			}, callback);
		}

		getTree(sha:string, recursive:bool, callback:(err:any, data:any) => void):string {
			var params = this.getRepoParams({
				sha: sha,
				recursive: recursive
			});
			return this.doCachedCall('getTree', params, {}, (cb) => {
				this._api.gitdata.getTree(params, cb);
			}, callback);
		}

		getCommit(sha:string, finish:(err, data:any) => void):string {
			var params = this.getRepoParams({
				sha: sha
			});
			return this.doCachedCall('getCommit', params, {}, (cb) => {
				this._api.gitdata.getCommit(params, cb);
			}, finish);
		}

		getBlob(sha:string, finish:(err, data:any) => void):string {
			var params = this.getRepoParams({
				sha: sha,
				per_page: 100
			});
			return this.doCachedCall('getBlob', params, {}, (cb) => {
				this._api.gitdata.getBlob(params, cb);
			}, finish);
		}

		getCommits(sha:string, finish:(err, data:any) => void):string {
			var params = this.getRepoParams({
				sha: sha
			});
			return this.doCachedCall('getCommits', params, {}, (cb) => {
				this._api.repos.getCommits(params, cb);
			}, finish);
		}

		private doCachedCall(label:string, keyTerms:any, opts:any, call:Function, callback:(err, data:any) => void):string {
			var key = this.getKey(label, keyTerms);
			var self:git.GithubAPICached = this;
			opts = _.defaults(opts || {}, self._defaultOpts);
			self.stats.count('called');

			// in memory cache?
			if (opts.cacheGet) {
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
					this.rate.readFromRes(res);

					if (err) {
						self.stats.count('call-error');
						return callback(err, null);
					}
					self.stats.count('call-success');

					var cached = new git.GithubAPICachedResult(label, key, res);

					// memory storage?
					if (opts.cacheSet) {
						self._cache.set(key, cached);
						self.stats.count('cache-set');
					}
					else {
						self.stats.count('cache-set-skip');
					}

					// permanent storage?
					if (opts.storeSet) {
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
			if (opts.storeGet) {
				self._store.getResult(key, (err, res:GithubAPICachedResult) => {
					if (err) {
						self.stats.count('store-get-error');
						return callback(err, null);
					}
					if (res) {
						self.stats.count('store-hit');
						return callback(null, res.data);
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

		get debug():bool {
			return this._debug;
		}

		set debug(value:bool) {
			this._debug = value;
			this.stats.log = value;
		}

		getCacheKey():string {
			return this._repo.getCacheKey() + '-v' + this._version;
		}
	}

	export class GitRateLimitInfo {

		limit:number = 0;
		remaining:number = 0;
		lastUpdate:Date = new Date();

		constructor() {

		}

		readFromRes(response:any) {
			if (response && _.isObject(response.meta)) {
				if (response.meta.hasOwnProperty('x-ratelimit-limit')) {
					this.limit = parseInt(response.meta['x-ratelimit-limit'], 10);
				}
				if (response.meta.hasOwnProperty('x-ratelimit-remaining')) {
					this.remaining = parseInt(response.meta['x-ratelimit-remaining'], 10);
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
