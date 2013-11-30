///<reference path="../../_ref.d.ts" />
///<reference path="GithubLoader.ts" />
///<reference path="../model/GitRateInfo.ts" />
///<reference path="../../../typings/underscore/underscore.d.ts" />
///<reference path="../../xm/io/HTTPCache.ts" />

module git {
	'use strict';

	var Q:typeof Q = require('q');
	var fs = require('fs');
	var path = require('path');
	var HTTP:typeof QioHTTP = require('q-io/http');


	/*
	 GithubAPI: access github rest-api with local cache (evading the non-auth rate-limit)
	 */
	//TODO find out if a HEAD requests counts for rate-limiting
	export class GithubAPI extends git.GithubLoader {

		static get_cachable = 'get_cachable';
		static get_rate = 'get_rate';

		//github's version
		private apiVersion:string = '3.0.0';

		constructor(repo:GithubRepo, storeDir:string) {
			super(repo, 'github-api', 'GithubAPI');
			xm.assertVar(storeDir, 'string', 'storeDir');

			this.formatVersion = '1.0';

			var opts = new xm.http.CacheOpts();
			this.cache = new xm.http.HTTPCache(path.join(storeDir, this.getCacheKey()), opts);

			this._initGithubLoader(['apiVersion']);
		}

		getBranches():Q.Promise<any> {
			var url = this.repo.urls.apiBranches();
			var request = new xm.http.Request(url);
			return this.getCachable<any>(request, true);
		}

		getBranch(branch:string):Q.Promise<any> {
			var url = this.repo.urls.apiBranch(branch);
			var request = new xm.http.Request(url);
			return this.getCachable<any>(request, true);
		}

		getTree(sha:string, recursive:boolean):Q.Promise<any> {
			var url = this.repo.urls.apiTree(sha, (recursive ? 1 : undefined));
			var request = new xm.http.Request(url);
			return this.getCachable<any>(request, true);
		}

		getCommit(sha:string):Q.Promise<any> {
			var url = this.repo.urls.apiCommit(sha);
			var request = new xm.http.Request(url);
			return this.getCachable<any>(request, true);
		}

		getBlob(sha:string):Q.Promise<any> {
			var url = this.repo.urls.apiBlob(sha);
			var request = new xm.http.Request(url);
			return this.getCachable<any>(request, true);
		}

		/*
		 getCommits(sha:string):Q.Promise<any> {
		 //TODO implement result pagination
		 var params = this.mergeParams({
		 per_page: 100,
		 sha: sha
		 });
		 }
		 */

		getPathCommits(path:string):Q.Promise<any> {
			//TODO implement result pagination
			var url = this.repo.urls.apiPathCommits(path);
			var request = new xm.http.Request(url);
			return this.getCachable<any>(request, true);
		}

		getCachable<T>(request:xm.http.Request, addMeta:boolean, koder?:xm.IContentKoder<T>):Q.Promise<T> {
			//TODO add some specific validation
			var koder = (koder || xm.JSONKoder.main);
			var d:Q.Deferred<T> = Q.defer();
			this.track.promise(d.promise, GithubAPI.get_cachable, request.url);

			if (!xm.isNumber(request.maxAge)) {
				request.maxAge = 30 * 60 * 1000;
			}
			this.copyHeadersTo(request.headers);
			request.headers['accept'] = 'application/json';
			request.lock();

			this.cache.getObject(request).progress(d.notify).then((object:xm.http.CacheObject) => {
				return koder.decode(object.body).then((res:any) => {
					if (object.response) {
						var rate = new git.GitRateInfo(object.response.headers);
						d.notify(rate);
					}
					if (addMeta && xm.isObject(res)) {
						res.meta = {rate: rate};
					}
					return res;
				}).then(d.resolve);
			}).fail(d.reject).done();

			return d.promise;
		}

		getRateInfo():Q.Promise<git.GitRateInfo> {
			var url = this.repo.urls.rateLimit();
			var d:Q.Deferred<git.GitRateInfo> = Q.defer();
			this.track.promise(d.promise, GithubAPI.get_rate, url);

			var req = HTTP.normalizeRequest(url);
			this.copyHeadersTo(req.headers);

			d.notify('get url: ' + url);
			var httpPromise = HTTP.request(req).then((res:QioHTTP.Response) => {
				var rate = new git.GitRateInfo(res.headers);
				d.resolve(rate);
			}, d.reject).done();

			return d.promise;
		}

		getCacheKey():string {
			return 'git-api-v' + this.apiVersion + '-fmt' + this.formatVersion;
		}
	}
}

