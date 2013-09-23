///<reference path="../_ref.ts" />
///<reference path="../xm/ObjectUtil.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/io/mkdirCheck.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/io/CachedLoader.ts" />
///<reference path="../xm/io/CachedFileService.ts" />
///<reference path="GithubURLManager.ts" />

module git {

	var request = require('request');
	var path = require('path');
	var Q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');

	/*
	 GithubRawCached: get files from raw.github.com and cache on disk
	 */
	//TODO add pruning/clear feature
	export class GithubRawCached {

		private _repo:git.GithubRepo;
		private _debug:bool = false;
		private _formatVersion:string = '0.0.2';

		private _service:xm.CachedFileService;
		private _loader:xm.CachedLoader;

		stats = new xm.StatCounter(false);

		constructor(repo:git.GithubRepo, storeFolder:string) {
			xm.assertVar('repo', repo, git.GithubRepo);
			xm.assertVar('storeFolder', storeFolder, 'string');

			this._repo = repo;

			var dir = path.join(storeFolder, this._repo.getCacheKey() + '-fmt' + this._formatVersion);
			this._service = new xm.CachedFileService(dir);
			this._loader = new xm.CachedLoader('GithubRawCached', this._service);

			this.stats.logger = xm.getLogger('GithubRawCached');

			xm.ObjectUtil.hidePrefixed(this);
		}

		getFile(commitSha:string, filePath:string):Qpromise {
			this.stats.count('start');

			var tmp = filePath.split(/\/|\\\//g);
			tmp.unshift(commitSha);

			var storeFile = <Function>(path.join).apply(null, tmp);

			if (this._debug) {
				xm.log(storeFile);
			}

			//TODO extract call-closure to method? beh?
			return this._loader.doCachedCall('getFile', storeFile, {}, () => {
				var reqOpts = {
					url: this._repo.urls.rawFile(commitSha, filePath)
				};
				if (this._debug) {
					xm.log(reqOpts.url);
				}
				this.stats.count('request-start');

				return Q.nfcall(request.get, reqOpts).spread((res) => {
					if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 400) {
						this.stats.count('request-error');
						throw new Error('unexpected status code: ' + res.statusCode);
					}
					this.stats.count('request-complete');
					// according to the headers raw github is binary encoded, but from what? utf8?
					//TODO find correct way to handle encoding type
					this.stats.logger(xm.toProtoString(res.body));
					return res.body;
				});
			});
		}

		get service():xm.CachedFileService {
			return this._service;
		}

		get loader():xm.CachedLoader {
			return this._loader;
		}

		get debug():bool {
			return this._debug;
		}

		set debug(value:bool) {
			this._debug = value;
			this.stats.log = value;
			this._loader.debug = value;
		}
	}
}
