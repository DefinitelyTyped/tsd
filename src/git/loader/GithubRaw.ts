///<reference path="../../_ref.d.ts" />
///<reference path="GithubLoader.ts" />
///<reference path="../../xm/hash.ts" />

module git {

	var path = require('path');
	var Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var HTTP:typeof QioHTTP = require('q-io/http');

	/*
	 GithubRaw: get files from raw.github.com and cache on disk
	 */
	//TODO add pruning/clear feature
	export class GithubRaw extends git.GithubLoader {

		static get_file:string = 'get_file';

		constructor(repo:git.GithubRepo, storeDir:string) {
			super(repo, 'github-raw', 'GithubRaw');
			xm.assertVar(storeDir, 'string', 'storeDir');

			this.formatVersion = '1.0';

			var opts = new xm.http.CacheOpts();
			opts.cacheCleanInterval = 30 * 24 * 3600 * 1000;
			this.cache = new xm.http.HTTPCache(path.join(storeDir, this.getCacheKey()), opts);

			this._initGithubLoader();
		}

		getText(commitSha:string, filePath:string):Q.Promise<string> {
			return this.getFile<string>(commitSha, filePath, xm.StringKoder.utf8);
		}

		getJSON(commitSha:string, filePath:string):Q.Promise<any> {
			return this.getFile<any>(commitSha, filePath, xm.JSONKoder.main);
		}

		getBinary(commitSha:string, filePath:string):Q.Promise<NodeBuffer> {
			return this.getFile<NodeBuffer>(commitSha, filePath, xm.ByteKoder.main);
		}

		getFile<T>(commitSha:string, filePath:string, koder:xm.IContentKoder<T>):Q.Promise<T> {
			//should be a low hex
			xm.assertVar(commitSha, 'sha1', 'commitSha');
			xm.assertVar(filePath, 'string', 'filePath');
			xm.assertVar(koder, 'object', 'koder');

			var d:Q.Deferred<T> = Q.defer();

			var url = this.repo.urls.rawFile(commitSha, filePath);
			this.track.promise(d.promise, GithubRaw.get_file, url);
			var headers = {};

			var request = new xm.http.Request(url, headers);
			request.localMaxAge = 30 * 24 * 3600 * 1000;
			request.httpInterval = 24 * 3600 * 1000;
			request.lock();

			this.cache.getObject(request).progress(d.notify).then((object:xm.http.CacheObject) => {
				this.track.success(GithubRaw.get_file);
				return koder.decode(object.body).then((res:T) => {
					d.resolve(res);
				});
			}).fail(d.reject).done();

			return d.promise;
		}

		getCacheKey():string {
			return 'git-raw-fmt' + this.formatVersion;
		}
	}
}
