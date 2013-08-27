///<reference path="../_ref.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="GithubURLManager.ts" />

module git {

	var request = require('request');
	var Q:QStatic = require('q');

	export class GithubRawFile {

		private _urls:git.GithubURLManager;

		constructor(urls:git.GithubURLManager) {
			xm.assertVar('urls', urls, git.GithubURLManager);

			this._urls = urls;
		}

		getFile(commit:string, path:string):Qpromise {
			var opts = {
				url: this._urls.rawFile(commit, path)
			};

			xm.log(opts.url);

			return Q.nfcall(request.get, opts).then((res) => {
				res = res[0];
				if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 400) {
					throw new Error('unexpected status code: ' + res.statusCode);
				}
				// according to the headers raw github is binary encoded, but from what? utf8?
				//TODO find correct way to handle this
				return String(res.body);
			});
		}
	}
}
