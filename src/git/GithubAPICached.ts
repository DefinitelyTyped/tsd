///<reference path="../_ref.d.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="../xm/ObjectUtil.ts" />
///<reference path="../xm/hash.ts" />
///<reference path="../xm/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/io/CachedJSONValue.ts" />
///<reference path="../xm/io/CachedLoader.ts" />
///<reference path="../xm/io/CachedJSONService.ts" />
///<reference path="GithubRepo.ts" />
///<reference path="GithubRateLimitInfo.ts" />

module git {
	'use strict';

	var _ = require('underscore');
	var Q:typeof Q = require('q');
	var fs = require('fs');
	var path = require('path');

	var Github = require('github');

	//move to a .d.ts?
	export interface GithubJS {
		repos:git.GithubJSRepos;
		gitdata:git.GithubJSData;
	}
	export interface GithubJSRepos {
		getBranches(params:any, calback:git.Callback);
		getBranch(params:any, calback:git.Callback);
		getCommits(params:any, calback:git.Callback);
	}
	export interface GithubJSData {
		getCommit(params:any, calback:git.Callback);
		getTree(params:any, calback:git.Callback);
		getBlob(params:any, calback:git.Callback);
	}
	export interface Callback {
		(err?:any, res?:any):void;
	}

	/*
	 GithubAPICached: access github rest-api with local cache (evading the non-auth rate-limit)
	 */
	//TODO implement http://developer.github.com/v3/#conditional-requests (add last-mod + etag to json store)
	//TODO find out if a HEAD requests counts for rate-limiting
	export class GithubAPICached {

		private _api:git.GithubJS;
		private _repo:git.GithubRepo;

		private _service:xm.CachedJSONService;
		private _loader:xm.CachedLoader<any>;

		//github's version
		private _apiVersion:string = '3.0.0';

		private _debug:boolean = false;

		constructor(repo:GithubRepo, storeFolder:string) {
			xm.assertVar(repo, GithubRepo, 'repo');
			xm.assertVar(storeFolder, 'string', 'storeFolder');

			this._repo = repo;
			this._api = <git.GithubJS> new Github({
				version: this._apiVersion
			});

			this._service = new xm.CachedJSONService(path.resolve(storeFolder, this.getCacheKey()));
			this._loader = new xm.CachedLoader('GithubAPICached', this._service);

			xm.ObjectUtil.hidePrefixed(this);
		}

		mergeParams(vars?:any):any {
			return _.defaults(vars || {}, {
				user: this._repo.ownerName,
				repo: this._repo.projectName
			});
		}

		getBranches():Q.Promise<any> {
			var params = this.mergeParams({});
			return this._loader.doCachedCall('getBranches', params, {}, () => {
				return Q.nfcall(this._api.repos.getBranches, params);
			});
		}

		getBranch(branch:string):Q.Promise<any> {
			var params = this.mergeParams({
				branch: branch
			});
			return this._loader.doCachedCall('getBranch', params, {}, () => {
				return Q.nfcall(this._api.repos.getBranch, params);
			});
		}

		getTree(sha:string, recursive:boolean):Q.Promise<any> {
			var params = this.mergeParams({
				sha: sha,
				recursive: recursive
			});
			return this._loader.doCachedCall('getTree', params, {}, () => {
				return Q.nfcall(this._api.gitdata.getTree, params);
			});
		}

		getCommit(sha:string):Q.Promise<any> {
			var params = this.mergeParams({
				sha: sha
			});
			return this._loader.doCachedCall('getCommit', params, {}, () => {
				return Q.nfcall(this._api.gitdata.getCommit, params);
			});
		}

		getBlob(sha:string):Q.Promise<any> {
			var params = this.mergeParams({
				sha: sha,
				per_page: 100
			});
			return this._loader.doCachedCall('getBlob', params, {}, () => {
				return Q.nfcall(this._api.gitdata.getBlob, params);
			});
		}

		getCommits(sha:string):Q.Promise<any> {
			//TODO implement result pagination
			var params = this.mergeParams({
				per_page: 100,
				sha: sha
			});
			return this._loader.doCachedCall('getCommits', params, {}, () => {
				return Q.nfcall(this._api.repos.getCommits, params);
			});
		}

		getPathCommits(sha:string, path:String):Q.Promise<any> {
			//TODO implement result pagination
			var params = this.mergeParams({
				per_page: 100,
				sha: sha,
				path: path
			});
			return this._loader.doCachedCall('getCommits', params, {}, () => {
				return Q.nfcall(this._api.repos.getCommits, params);
			});
		}

		get service():xm.CachedJSONService {
			return this._service;
		}

		get loader():xm.CachedLoader<any> {
			return this._loader;
		}

		get debug():boolean {
			return this._debug;
		}

		set debug(value:boolean) {
			this._debug = value;
			this._service.store.stats.log = value;
			this._loader.debug = value;
		}

		getCacheKey():string {
			return this._repo.getCacheKey() + '-api' + this._apiVersion;
		}
	}
}

