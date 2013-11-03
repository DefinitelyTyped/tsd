///<reference path="../_ref.d.ts" />
///<reference path="../xm/ObjectUtil.ts" />
///<reference path="../xm/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/io/CachedLoader.ts" />
///<reference path="../xm/io/CachedFileService.ts" />
///<reference path="GithubURLManager.ts" />

module git {

	var path = require('path');
	var Q:typeof Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var HTTP:typeof QioHTTP = require('q-io/http');

	/*
	 GithubRawCached: get files from raw.github.com and cache on disk
	 */
	//TODO add pruning/clear feature
	export class GithubRawCached {

		private _repo:git.GithubRepo;
		private _debug:boolean = false;
		private _formatVersion:string = '0.2';

		private _service:xm.CachedFileService;
		private _loader:xm.CachedLoader<NodeBuffer>;

		stats = new xm.StatCounter(false);
		log = xm.getLogger('GithubRawCached');
		headers = {
			'User-Agent': 'xm.GithubRawCached'
		};

		constructor(repo:git.GithubRepo, storeFolder:string) {
			xm.assertVar(repo, git.GithubRepo, 'repo');
			xm.assertVar(storeFolder, 'string', 'storeFolder');
			this._repo = repo;

			var dir = path.join(storeFolder, this._repo.getCacheKey() + '-fmt' + this._formatVersion);

			this._service = new xm.CachedFileService(dir);
			this._loader = new xm.CachedLoader('GithubRawCached', this._service);

			this.stats.logger = this.log;

			xm.ObjectUtil.hidePrefixed(this);
		}

		getFile(commitSha:string, filePath:string):Q.Promise<NodeBuffer> {
			var d:Q.Deferred<NodeBuffer> = Q.defer();

			this.stats.count('start');

			var tmp = filePath.split(/\/|\\\//g);
			tmp.unshift(commitSha);

			var storeFile:string = FS.join(tmp);

			if (this._debug) {
				this.log(storeFile);
			}

			this._loader.doCachedCall('GithubRawCached.getFile', storeFile, {}, () => {
				var req = HTTP.normalizeRequest(this._repo.urls.rawFile(commitSha, filePath));
				req.headers = this.headers;

				if (this._debug) {
					this.log(req);
				}
				this.stats.count('request-start');

				return HTTP.request(req).then((res:QioHTTP.Response) => {
					if (!res.status || res.status < 200 || res.status >= 400) {
						this.stats.count('request-error');
						throw new Error('unexpected status code: ' + res.status);
					}
					if (this._debug) {
						this.log.inspect(res, 1, 'res');
					}
					//this.log.inspect(res, 'res', 1);
					this.stats.count('request-complete');

					//TODO streams all the way?
					return res.body.read();
				});
			}).then((value) => {
				d.resolve(value);
			}, d.reject);

			return d.promise;
		}

		get service():xm.CachedFileService {
			return this._service;
		}

		get loader():xm.CachedLoader<NodeBuffer> {
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
