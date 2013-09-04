///<reference path="../_ref.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="../xm/ObjectUtil.ts" />
///<reference path="../xm/io/hash.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/io/mkdirCheck.ts" />
///<reference path="GithubAPICached.ts" />
///<reference path="GithubAPICachedResult.ts" />

module git {

	var Q:QStatic = require('q');
	var assert = require('assert');
	var fs = require('fs');
	var path = require('path');
	var FS:Qfs = require('q-io/fs');
	/*
	 GithubAPICachedJSONStore: data-store for cached github api results
	 */
	//TODO consider alternate storage? not worth it?
	//TODO generalise this for re-use?
	//TODO add gzip compression?
	export class GithubAPICachedJSONStore {

		dir:string;
		stats:xm.StatCounter = new xm.StatCounter();

		private _formatVersion:string = '0.0.3';

		constructor(public api:git.GithubAPICached, dir:string) {
			xm.assertVar('api', api, git.GithubAPICached);
			xm.assertVar('dir', dir, 'string');

			this.dir = path.join(dir, api.getCacheKey() + '-fmt' + this._formatVersion);

			this.stats.log = this.api.debug;
			this.stats.logger = xm.getLogger('GithubAPICachedJSONStore');

			xm.ObjectUtil.hidePrefixed(this);
		}

		private init():Qpromise {
			this.stats.count('init-called');

			return FS.exists(this.dir).then((exists:bool) => {
				if (!exists) {
					this.stats.count('init-create-dir', this.dir);
					return xm.mkdirCheckQ(this.dir, true);
				}

				return FS.isDirectory(this.dir).then((isDir:bool) => {
					if (isDir) {
						return null;
					}
					else {
						throw new Error('is not a directory: ' + this.dir);
					}
				});
			}).fail((err) => {
				this.stats.count('init-error');
				throw err;
			});
		}

		getResult(key:string):Qpromise {
			var src = path.join(this.dir, GithubAPICachedResult.getHash(key) + '.json');

			this.stats.count('get-called');

			return this.init().then(() => {
				return FS.exists(src);
			}).then((exists:bool) => {
				if (exists) {
					this.stats.count('get-exists');

					return xm.FileUtil.readJSONPromise(src).then((json) => {
						var cached;
						try {
							cached = GithubAPICachedResult.fromJSON(json);
						}
						catch (e) {
							this.stats.count('get-read-error');
							throw(new Error(src + ':' + e));
						}
						this.stats.count('get-read-success');
						return cached;
					});
				}
				this.stats.count('get-miss');
				return null;
			}).fail((err) => {
				this.stats.count('get-error');
				throw err;
			});
		}

		storeResult(res:GithubAPICachedResult):Qpromise {
			var dest = path.join(this.dir, res.getHash() + '.json');

			this.stats.count('store-called');

			return this.init().then(() => {
				return FS.exists(dest);
			}).then((exists:bool) => {
				if (exists) {
					this.stats.count('store-overwrite');
					return FS.remove(dest);
				}
				this.stats.count('store-new');
				return null;
			}).then(() => {
				var data = JSON.stringify(res.toJSON(), null, 2);
				return FS.write(dest, data);
			}).then(() => {
				this.stats.count('store-written');
				return {dest: dest};
			}, (err) => {
				this.stats.count('store-write-error');
				throw err;
			});
		}
	}
}
