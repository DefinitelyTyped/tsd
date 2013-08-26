///<reference path="../_ref.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="GithubURLManager.ts" />
///<reference path="GithubRepo.ts" />

module git {

	var request = require('request');

	export class GithubRawFile {

		private _repo:GithubRepo;
		private _urls:git.GithubURLManager;

		constructor(urls:git.GithubURLManager) {
			xm.assertVar('urls', urls, git.GithubURLManager);

			this._urls = urls;
		}

		getFile(commit:string, path:string, callback:(err, content:any) => void) {
			var opts = {
				url: this._urls.rawFile(commit, path)
			};

			xm.log(opts.url);

			request.get(opts, (err, res) => {
				if (err) {
					return callback(err, null);
				}
				if (res.statusCode >= 200 && res.statusCode < 400) {
					// according to the headers raw github is binary encoded
					// so let's pull it through a buffer.toString()
					//TODO verify this shouldn't be utf8
					var content = new Buffer(res.body).toString();

					return callback(null, content);
				}
				return callback('unexpected status code: ' + res.statusCode, null);
			});
		}
	}
}
