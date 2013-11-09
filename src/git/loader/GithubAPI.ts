///<reference path="../../_ref.d.ts" />
///<reference path="GithubLoader.ts" />

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

		//github's version
		private apiVersion:string = '3.0.0';

		constructor(repo:GithubRepo, storeDir:string) {
			super(repo, 'github-api', 'GithubAPI');
			xm.assertVar(storeDir, 'string', 'storeDir');

			this.formatVersion = '1.0';

			var dir = path.join(storeDir.replace(/[\\\/]+$/, ''), this.repo.getCacheKey() + '-api' + this.apiVersion + '-fmt' + this.formatVersion);
			this.cache = new xm.HTTPCache(dir, null, null);

			this._initGithubLoader(['apiVersion']);
		}

		mergeParams(vars?:any):any {
			return _.defaults(vars || {}, {
				user: this.repo.ownerName,
				repo: this.repo.projectName
			});
		}

		getBranches():Q.Promise<any> {
			var params = this.mergeParams({});

		}

		getBranch(branch:string):Q.Promise<any> {
			var params = this.mergeParams({
				branch: branch
			});

		}

		getTree(sha:string, recursive:boolean):Q.Promise<any> {
			var params = this.mergeParams({
				sha: sha,
				recursive: recursive
			});
		}

		getCommit(sha:string):Q.Promise<any> {
			var params = this.mergeParams({
				sha: sha
			});
		}

		getBlob(sha:string):Q.Promise<any> {
			var params = this.mergeParams({
				sha: sha,
				per_page: 100
			});
		}

		getCommits(sha:string):Q.Promise<any> {
			//TODO implement result pagination
			var params = this.mergeParams({
				per_page: 100,
				sha: sha
			});
		}

		getPathCommits(sha:string, path:String):Q.Promise<any> {
			//TODO implement result pagination
			var params = this.mergeParams({
				per_page: 100,
				sha: sha,
				path: path
			});
		}

		getFile<T>(params, koder:xm.IContentKoder<T>):Q.Promise<T> {
			//should be a low hex
			xm.assertVar(commitSha, 'sha1', 'commitSha');
			xm.assertVar(filePath, 'sha1Short', 'filePath');
			xm.assertVar(koder, 'object', 'koder');

			var d:Q.Deferred<T> = Q.defer();
			this.track.promise(d.promise, GithubRaw.get_file);

			var url = this.repo.urls.rawFile(commitSha, filePath);
			var headers = {};

			var request = new xm.HTTPRequest(url, headers, koder.ext);
			request.lock();

			this.cache.getObject(request).then((object:xm.HTTPCacheObject) => {
				this.track.success(GithubRaw.get_file);
				return koder.decode(object.body);
			}).then(d.resolve, d.reject).done();

			return d.promise;
		}
	}
}

