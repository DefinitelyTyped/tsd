///<reference path="../../_ref.d.ts" />
///<reference path="GithubLoader.ts" />
///<reference path="../../../typings/underscore/underscore.d.ts" />
///<reference path="../../xm/io/HTTPCache.ts" />

module git {
	'use strict';

	var Q:typeof Q = require('q');
	var fs = require('fs');
	var path = require('path');

	/*
	 GithubAPI: access github rest-api with local cache (evading the non-auth rate-limit)
	 */
	//TODO find out if a HEAD requests counts for rate-limiting
	export class GithubAPI extends git.GithubLoader {

		static get_file = 'get_file';

		metaHeaders:any = {};

		//github's version
		private apiVersion:string = '3.0.0';

		constructor(repo:GithubRepo, storeDir:string) {
			super(repo, 'github-api', 'GithubAPI');
			xm.assertVar(storeDir, 'string', 'storeDir');

			this.formatVersion = '1.0';

			var opts = new xm.http.CacheOpts();
			this.cache = new xm.http.HTTPCache(path.join(storeDir, this.getCacheKey()), opts);

			this._initGithubLoader(['apiVersion']);

			this.metaHeaders['x-ratelimit-limit'] = parseInt;
			this.metaHeaders['x-ratelimit-remaining'] = parseInt;
			this.metaHeaders['x-ratelimit-reset'] = function (value) {
				return new Date(parseInt(value, 10) * 1000);
			};
		}

		getBranches():Q.Promise<any> {
			var url = this.repo.urls.apiBranches();
			var request = new xm.http.Request(url);
			return this.getFile<any>(request, true);
		}

		getBranch(branch:string):Q.Promise<any> {
			var url = this.repo.urls.apiBranch(branch);
			var request = new xm.http.Request(url);
			return this.getFile<any>(request, true);
		}

		getTree(sha:string, recursive:boolean):Q.Promise<any> {
			var url = this.repo.urls.apiTree(sha, (recursive ? 1 : undefined));
			var request = new xm.http.Request(url);
			return this.getFile<any>(request, true);
		}

		getCommit(sha:string):Q.Promise<any> {
			var url = this.repo.urls.apiCommit(sha);
			var request = new xm.http.Request(url);
			return this.getFile<any>(request, true);
		}

		getBlob(sha:string):Q.Promise<any> {
			var url = this.repo.urls.apiBlob(sha);
			var request = new xm.http.Request(url);
			return this.getFile<any>(request, true);
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
		getPathCommits(sha:string, path:string):Q.Promise<any> {
			//TODO implement result pagination
			var url = this.repo.urls.apiPathCommits(sha, path);
			var request = new xm.http.Request(url);
			return this.getFile<any>(request, true);
		}

		getFile<T>(request:xm.http.Request, addMeta:boolean, koder?:xm.IContentKoder<T>):Q.Promise<T> {
			//TODO add some schema validation
			var koder = (koder || xm.JSONKoder.main);

			var d:Q.Deferred<T> = Q.defer();
			this.track.promise(d.promise, GithubAPI.get_file, request.url);

			request.lock();

			this.cache.getObject(request).progress(d.notify).then((object:xm.http.CacheObject) => {
				return koder.decode(object.body).then((res:any) => {
					if (addMeta && xm.isObject(res)) {
						res.meta = {};
						if (object.response) {
							Object.keys(this.metaHeaders).forEach((key:string) => {
								if (xm.hasOwnProp(object.response.headers, key)) {
									res.meta[key] = this.metaHeaders[key](object.response.headers[key]);
								}
							});
						}
					}
					return res;
				}).then(d.resolve);
			}).fail(d.reject).done();

			return d.promise;
		}

		getCacheKey():string {
			return 'git-api-v' + this.apiVersion + '-fmt' + this.formatVersion;
		}
	}
}

