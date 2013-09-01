///<reference path="../_ref.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/io/mkdirCheck.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="GithubURLManager.ts" />

module git {

	var request = require('request');
	var path = require('path');
	var Q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');

	export class GithubRawCached {

		private _repo:git.GithubRepo;
		private _dir:string;
		private _debug:bool = false;
		private _formatVersion:string = '0.0.1';

		stats = new xm.StatCounter(false);

		constructor(repo:git.GithubRepo, storeFolder:string) {
			xm.assertVar('repo', repo, git.GithubRepo);
			xm.assertVar('storeFolder', storeFolder, 'string');

			this._repo = repo;
			this._dir = path.join(storeFolder, this._repo.getCacheKey() + '-fmt' + this._formatVersion);
		}

		//TODO refactor or wrap: load by commit-sha, but save to blob-sha: keep a data file that maps this (maybe not in this class though)
		getFile(commitSha:string, filePath:string):Qpromise {
			this.stats.count('invoked');

			var tmp = filePath.split(/\/|\\\//g);
			tmp.unshift(commitSha);
			tmp.unshift(this._dir);

			var storeFile = path.join.apply(null, tmp);
			if (this._debug) {
				xm.log(storeFile);
			}

			return FS.exists(storeFile).then((exists:bool) => {
				if (exists) {
					return FS.isFile(storeFile).then((isFile:bool) => {
						if (!isFile) {
							throw(new Error('path exists but is not a file: ' + storeFile));
						}
						this.stats.count('store-hit');
						return FS.read(storeFile);
					});
				}
				else {
					this.stats.count('store-miss');

					var opts = {
						url: this._repo.urls.rawFile(commitSha, filePath)
					};
					if (this._debug) {
						xm.log(opts.url);
					}

					return Q.nfcall(request.get, opts).spread((res) => {
						if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 400) {
							throw new Error('unexpected status code: ' + res.statusCode);
						}
						// according to the headers raw github is binary encoded, but from what? utf8?
						//TODO find correct way to handle binary encoding type (low prio)
						var content = String(res.body);

						return xm.mkdirCheckQ(path.dirname(storeFile)).then(() => {
							return FS.write(storeFile, content);
						}).then(() => {
							this.stats.count('store-set');
							return content;
						}, (err) => {
							this.stats.count('store-error');
							//throw(err);
							//TODO whut2do?
							return content;
						});
					});
				}
			});
		}

		get debug():bool {
			return this._debug;
		}

		set debug(value:bool) {
			this._debug = value;
			this.stats.log = value;
		}
	}
}
