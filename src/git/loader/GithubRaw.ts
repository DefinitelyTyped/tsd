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

			var dir = path.join(storeDir.replace(/[\\\/]+$/, ''), this.repo.getCacheKey() + '-fmt' + this.formatVersion);
			var opts = new xm.HTTPCacheOpts();
			this.cache = new xm.HTTPCache(dir, opts);

			this._initGithubLoader();
		}

		getText(commitSha:string, filePath:string, koder:xm.IContentKoder):Q.Promise<String> {
			return this.getFile<String>(commitSha, filePath, xm.UTFKoder.main);
		}

		getJSON(commitSha:string, filePath:string):Q.Promise<any> {
			return this.getFile<any>(commitSha, filePath, xm.JSONKoder.main);
		}

		getBinary(commitSha:string, filePath:string, koder:xm.IContentKoder):Q.Promise<NodeBuffer> {
			return this.getFile<NodeBuffer>(commitSha, filePath, xm.ByteKoder.main);
		}

		getFile<T>(commitSha:string, filePath:string, koder:xm.IContentKoder<T>):Q.Promise<T> {
			//should be a low hex
			xm.assertVar(commitSha, 'sha1', 'commitSha');
			xm.assertVar(filePath, 'sha1Short', 'filePath');
			xm.assertVar(koder, 'object', 'koder');

			var d:Q.Deferred<T> = Q.defer();
			this.track.promise(d.promise, GithubRaw.get_file);

			var url = this.repo.urls.rawFile(commitSha, filePath);
			var headers = {};

			var request = new xm.HTTPRequest(url, headers, koder.extension);
			request.lock();

			this.cache.getObject(request).then((object:xm.HTTPCacheObject) => {
				this.track.success(GithubRaw.get_file);
				return koder.decode(object.buffer);
			}).then(d.resolve, d.reject).done();

			return d.promise;
		}
	}
}
