///<reference path="../_ref.d.ts" />
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
	var HTTP:Qhttp = require('q-io/http');

	/*
	 GithubRawCached: get files from raw.github.com and cache on disk
	 */
	//TODO add pruning/clear feature
	export class GithubRawCached {

		private _repo:git.GithubRepo;
		private _debug:boolean = false;
		private _formatVersion:string = '0.2';

		private _service:xm.CachedFileService;
		private _loader:xm.CachedLoader;

		stats = new xm.StatCounter(false);
		log = xm.getLogger('GithubRawCached');
		headers = {
			'User-Agent': 'xm.GithubRawCached'
		};

		constructor(repo:git.GithubRepo, storeFolder:string) {
			xm.assertVar('repo', repo, git.GithubRepo);
			xm.assertVar('storeFolder', storeFolder, 'string');

			this._repo = repo;

			var dir = path.join(storeFolder, this._repo.getCacheKey() + '-fmt' + this._formatVersion);

			this._service = new xm.CachedFileService(dir);
			this._loader = new xm.CachedLoader('GithubRawCached', this._service);

			this.stats.logger = this.log;

			xm.ObjectUtil.hidePrefixed(this);
		}

		getFile(commitSha:string, filePath:string):Qpromise {
			this.stats.count('start');

			var tmp = filePath.split(/\/|\\\//g);
			tmp.unshift(commitSha);

			var storeFile = <Function>(path.join).apply(null, tmp);

			if (this._debug) {
				this.log(storeFile);
			}

			return this._loader.doCachedCall('GithubRawCached.getFile', storeFile, {}, () => {

				var req = HTTP.normalizeRequest(this._repo.urls.rawFile(commitSha, filePath));
				req.headers = this.headers;

				if (this._debug) {
					this.log(req);
				}
				this.stats.count('request-start');

				return HTTP.request(req).then((res:Qresponse) => {
					if (!res.status || res.status < 200 || res.status >= 400) {
						this.stats.count('request-error');
						throw new Error('unexpected status code: ' + res.status);
					}
					if (this._debug) {
						this.log.inspect(res, 'res', 1);
					}
					//this.log.inspect(res, 'res', 1);
					this.stats.count('request-complete');

					//TODO streams all the way?
					return res.body.read();
				});
			});

			//TODO extract call-closure to method? beh?
			/*return this._loader.doCachedCall('GithubRawCached.getFile', storeFile, {}, () => {
				var reqOpts = {
					url: this._repo.urls.rawFile(commitSha, filePath),
					headers: this.headers
				};
				if (this._debug) {
					this.log(reqOpts);
				}
				this.stats.count('request-start');

				return Q.nfcall(request.get, reqOpts).spread((res) => {
					if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 400) {
						this.stats.count('request-error');
						throw new Error('unexpected status code: ' + res.statusCode);
					}
					//this.log.inspect(res, 'res', 1);
					this.stats.count('request-complete');
					// according to the headers raw github is binary encoded, but from what? utf8?
					//TODO find correct way to handle encoding type
					return res.body;
				});
			});*/
		}

		get service():xm.CachedFileService {
			return this._service;
		}

		get loader():xm.CachedLoader {
			return this._loader;
		}

		get debug():boolean {
			return this._debug;
		}

		set debug(value:boolean) {
			this._debug = value;
			this.stats.log = value;
			this._loader.debug = value;
		}
	}
}
