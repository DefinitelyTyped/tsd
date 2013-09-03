///<reference path="../_ref.ts" />
///<reference path="../xm/ObjectUtil.ts" />
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

	/*
	 GithubRawCached: get files from raw.github.com and cache on disk
	 */
	//TODO add pruning/clear feature
	export class GithubRawCached {

		private _repo:git.GithubRepo;
		private _dir:string;
		private _debug:bool = false;
		private _formatVersion:string = '0.0.1';
		private _active:xm.KeyValueMap = new xm.KeyValueMap();

		stats = new xm.StatCounter(false);

		constructor(repo:git.GithubRepo, storeFolder:string) {
			xm.assertVar('repo', repo, git.GithubRepo);
			xm.assertVar('storeFolder', storeFolder, 'string');

			this._repo = repo;
			this._dir = path.join(storeFolder, this._repo.getCacheKey() + '-fmt' + this._formatVersion);

			xm.ObjectUtil.hidePrefixed(this);
		}

		//TODO cache promises while loading to harden against race conditions
		getFile(commitSha:string, filePath:string):Qpromise {
			this.stats.count('invoked');

			var tmp = filePath.split(/\/|\\\//g);
			tmp.unshift(commitSha);
			tmp.unshift(this._dir);

			var key = commitSha + '/' + filePath;

			var storeFile = path.join.apply(null, tmp);
			if (this._debug) {
				xm.log(storeFile);
			}

			//reuse promise if we are not already getting this file
			if (this._active.has(key)) {
				this.stats.count('active-hit');
				return this._active.get(key).then((content) => {
					this.stats.count('active-resolve');
					return content;
				}, (err) => {
					this.stats.count('active-error');
					//rethrow
					throw err;
				});
			}

			//keep the promise; first check the cache
			var promise = FS.exists(storeFile).then((exists:bool) => {
				if (exists) {
					return FS.isFile(storeFile).then((isFile:bool) => {
						if (!isFile) {
							throw(new Error('path exists but is not a file: ' + storeFile));
						}
						this.stats.count('store-hit');

						//read from cache and be done
						return FS.read(storeFile);
					});
				}
				else {
					//not in cache
					this.stats.count('store-miss');

					var opts = {
						url: this._repo.urls.rawFile(commitSha, filePath)
					};
					if (this._debug) {
						xm.log(opts.url);
					}

					//do the actual download
					return Q.nfcall(request.get, opts).spread((res) => {
						if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 400) {
							throw new Error('unexpected status code: ' + res.statusCode);
						}
						// according to the headers raw github is binary encoded, but from what? utf8?
						//TODO find correct way to handle binary encoding type (low prio)
						var content = String(res.body);

						//write it to cache
						return xm.mkdirCheckQ(path.dirname(storeFile)).then(() => {
							return FS.write(storeFile, content);
						}).then(() => {
							this.stats.count('store-set');
							return content;
						}, (err) => {
							this.stats.count('store-error');
							//TODO whut2do?
							xm.log.warn('could not write to store');
							//throw(err);
							//still return data?
							return content;
						}).then((content) => {
							// make this catch() instead?
							// drop the promise from active list
							this._active.remove(key);
							//be done
							return content;
						});
					});
				}
			});
			//keep promise while we are loading
			this._active.set(key, promise);
			return promise;
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
