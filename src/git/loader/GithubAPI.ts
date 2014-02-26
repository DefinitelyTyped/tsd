/// <reference path="../../_ref.d.ts" />
/// <reference path="GithubLoader.ts" />
/// <reference path="../model/GitRateInfo.ts" />
/// <reference path="../../xm/http/HTTPCache.ts" />

module git {
	'use strict';

	var Q:typeof Q = require('q');
	var fs = require('fs');
	var path = require('path');
	var HTTP:typeof QioHTTP = require('q-io/http');


	/*
	 GithubAPI: access github rest-api with local cache (evading the non-auth rate-limit)
	 */
	// TODO add OAuth support (here or in HTTPCache)
	export class GithubAPI extends git.GithubLoader {

		static get_cachable = 'get_cachable';
		static get_rate = 'get_rate';

		// github's version
		private apiVersion:string = '3.0.0';

		constructor(repo:GithubRepo, options:xm.JSONPointer, storeDir:string) {
			super(repo, options, storeDir, 'github-api', 'GithubAPI');

			this.formatVersion = '1.0';

			this._initGithubLoader(['apiVersion']);
		}

		getBranches():Q.Promise<any> {
			return this.getCachableURL(this.repo.urls.apiBranches());
		}

		getBranch(branch:string):Q.Promise<any> {
			return this.getCachableURL(this.repo.urls.apiBranch(branch));
		}

		getTree(sha:string, recursive:boolean):Q.Promise<any> {
			return this.getCachableURL(this.repo.urls.apiTree(sha, (recursive ? 1 : undefined)));
		}

		getCommit(sha:string):Q.Promise<any> {
			return this.getCachableURL(this.repo.urls.apiCommit(sha));
		}

		getBlob(sha:string):Q.Promise<any> {
			return this.getCachableURL(this.repo.urls.apiBlob(sha));
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
			// TODO implement result pagination
			return this.getCachableURL(this.repo.urls.apiPathCommits(path));
		}

		getCachableURL(url:string):Q.Promise<any> {
			var request = new xm.http.CacheRequest(url);
			return this.getCachable<any>(request, true);
		}

		getCachable<T>(request:xm.http.CacheRequest, addMeta:boolean, koder?:xm.IContentKoder<T>):Q.Promise<T> {
			// TODO add some specific validation
			var koder = (koder || xm.JSONKoder.main);
			var d:Q.Deferred<T> = Q.defer();
			this.track.promise(d.promise, GithubAPI.get_cachable, request.url);

			if (!xm.isNumber(request.localMaxAge)) {
				request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
			}
			if (!xm.isNumber(request.httpInterval)) {
				request.httpInterval = this.options.getDurationSecs('httpInterval') * 1000;
			}
			this.copyHeadersTo(request.headers);

			request.headers['accept'] = 'application/vnd.github.beta+json';

			request.lock();

			this.cache.getObject(request).progress(d.notify).then((object:xm.http.CacheObject) => {
				return koder.decode(object.body).then((res:any) => {
					if (object.response) {
						var rate = new git.GitRateInfo(object.response.headers);
						d.notify({
							message: rate.toString(),
							data: rate
						});
					}
					if (addMeta && xm.isObject(res)) {
						res.meta = {rate: rate};
					}
					return res;
				});
			}).then(d.resolve, d.reject).done();

			return d.promise;
		}

		getRateInfo():Q.Promise<git.GitRateInfo> {
			var url = this.repo.urls.rateLimit();
			var d:Q.Deferred<git.GitRateInfo> = Q.defer();
			this.track.promise(d.promise, GithubAPI.get_rate, url);

			var req = HTTP.normalizeRequest(url);
			this.copyHeadersTo(req.headers);

			d.notify({
				message: 'get url: ' + url
			});
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

