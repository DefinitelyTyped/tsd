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
	var Q:QStatic = require('q');
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
		private _formatVersion:string = '0.0.1';
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
				version: '3.0.0'
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

		getCachedRaw(key:string):Qpromise {
			var self:git.GithubAPICached = this;
			if (self._cache.has(key)) {
				return Q.fcall(() => {
					return self._cache.get(key);
				});
			}
			return self._store.getResult(key);
		}

		getKey(label:string, keyTerms?:any):string {
			return xm.jsonToIdent([label, keyTerms ? keyTerms : {}]);
		}

		getBranches():Qpromise {
			var params = this.getRepoParams({});
			return this.doCachedCall('getBranches', params, {}, (cb) => {
				this._api.repos.getBranches(params, cb);
			});
		}

		getBranch(branch:string):Qpromise {
			var params = this.getRepoParams({
				branch: branch
			});
			return this.doCachedCall('getBranch', params, {}, (cb) => {
				this._api.repos.getBranch(params, cb);
			});
		}

		getTree(sha:string, recursive:bool):Qpromise {
			var params = this.getRepoParams({
				sha: sha,
				recursive: recursive
			});
			return this.doCachedCall('getTree', params, {}, (cb) => {
				this._api.gitdata.getTree(params, cb);
			});
		}

		getCommit(sha:string):Qpromise {
			var params = this.getRepoParams({
				sha: sha
			});
			return this.doCachedCall('getCommit', params, {}, (cb) => {
				this._api.gitdata.getCommit(params, cb);
			});
		}

		getBlob(sha:string):Qpromise {
			var params = this.getRepoParams({
				sha: sha,
				per_page: 100
			});
			return this.doCachedCall('getBlob', params, {}, (cb) => {
				this._api.gitdata.getBlob(params, cb);
			});
		}

		getCommits(sha:string):Qpromise {
			var params = this.getRepoParams({
				per_page : 100,
				sha: sha
			});
			return this.doCachedCall('getCommits', params, {}, (cb) => {
				this._api.repos.getCommits(params, cb);
			});
		}

		getPathCommits(sha:string, path:String):Qpromise {
			var params = this.getRepoParams({
				per_page : 100,
				sha : sha,
				path: path
			});
			return this.doCachedCall('getCommits', params, {}, (cb) => {
				this._api.repos.getCommits(params, cb);
			});
		}

		//TODO promise-ify this further
		private doCachedCall(label:string, keyTerms:any, opts:any, call:Function):Qpromise {
			var key = this.getKey(label, keyTerms);
			var self:git.GithubAPICached = this;
			opts = _.defaults(opts || {}, self._defaultOpts);
			self.stats.count('invoked');

			// in memory cache?
			if (opts.cacheGet) {
				if (this._cache.has(key)) {
					self.stats.count('cache-hit');

					return Q.fcall(() => {
						return this._cache.get(key).data;
					});
				}
				self.stats.count('cache-miss');
			}
			else {
				self.stats.count('cache-get-skip');
			}

			var defer = Q.defer();

			// subroutine
			var execCall = () => {
				self.stats.count('call-api');

				// classic callback
				call.call(null, (err, res:any) => {
					self.rate.readFromRes(res);
					if (self._debug) {
						xm.log(self.rate.toStatus());
					}

					if (err) {
						self.stats.count('call-error');
						defer.reject(err);
						return;
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
						self._store.storeResult(cached, (err) => {
							if (err) {
								self.stats.count('store-set-error');
								defer.reject(err);
							}
							else {
								self.stats.count('store-set');
								defer.resolve(res);
							}
						});
					}
					else {
						self.stats.count('store-set-skip');
						defer.resolve(res);
					}
				});
			};

			// in permanent store?
			if (opts.storeGet) {
				self._store.getResult(key).then((res:GithubAPICachedResult) => {
					if (res) {
						self.stats.count('store-hit');
						defer.resolve(res.data);
					}
					else {
						self.stats.count('store-miss');
						execCall();
					}
				}, (err) => {
					self.stats.count('store-get-error');
					defer.reject(err);
				});
			}
			else {
				self.stats.count('store-get-skip');
				execCall();
			}
			return defer.promise;
		}

		get debug():bool {
			return this._debug;
		}

		set debug(value:bool) {
			this._debug = value;
			this.stats.log = value;
		}

		getCacheKey():string {
			return this._repo.getCacheKey() + '-v' + this._formatVersion;
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
