/// <reference path="../../_ref.d.ts" />
/// <reference path="GithubLoader.ts" />
/// <reference path="../../xm/hash.ts" />

module git {
	'use strict';

	var path = require('path');
	var Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var HTTP:typeof QioHTTP = require('q-io/http');

	/*
	 GithubRaw: get files from raw.github.com and cache on disk
	 */
	export class GithubRaw extends git.GithubLoader {

		static get_file:string = 'get_file';

		constructor(repo:GithubRepo, options:xm.JSONPointer, storeDir:string) {
			super(repo, options, storeDir, 'github-raw', 'GithubRaw');

			this.formatVersion = '1.0';

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
			// should be a low hex
			xm.assertVar(commitSha, 'sha1', 'commitSha');
			xm.assertVar(filePath, 'string', 'filePath');
			xm.assertVar(koder, 'object', 'koder');

			var d:Q.Deferred<T> = Q.defer();

			var url = this.repo.urls.rawFile(commitSha, filePath);
			this.track.promise(d.promise, GithubRaw.get_file, url);
			var headers = {};

			var request = new xm.http.CacheRequest(url, headers);
			request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
			request.httpInterval = this.options.getDurationSecs('httpInterval') * 1000;
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
