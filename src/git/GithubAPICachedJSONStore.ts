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
		private _formatVersion:string = '0.0.2';

		constructor(public api:git.GithubAPICached, dir:string) {
			xm.assertVar('api', api, git.GithubAPICached);
			xm.assertVar('dir', dir, 'string');

			this.dir = path.join(dir, api.getCacheKey() + '-fmt' + this._formatVersion);

			xm.ObjectUtil.hidePrefixed(this);
		}

		private init():Qpromise {
			return FS.exists(this.dir).then((exists:bool) => {
				if (!exists) {
					return xm.mkdirCheckQ(this.dir);
				}
				else {
					return FS.isDirectory(this.dir).then((isDir:bool) => {
						if (isDir) {
							return null;
						}
						else {
							throw new Error('is not a directory: ' + this.dir);
						}
					});
				}
			});
		}

		getResult(key:string):Qpromise {
			var src = path.join(this.dir, GithubAPICachedResult.getHash(key) + '.json');

			return this.init().then(() => {
				return FS.exists(src);
			}).then((exists:bool) => {
				if (exists) {
					return Q.nfcall(xm.FileUtil.readJSON, src).then((json) => {
						var cached;
						try {
							cached = GithubAPICachedResult.fromJSON(json);
						}
						catch (e) {
							throw(new Error(src + ':' + e));
						}
						return cached;
					});
				}
				else {
					return null;
				}
			});
		}

		storeResult(res:GithubAPICachedResult):Qpromise {
			var src = path.join(this.dir, res.getHash() + '.json');

			return this.init().then(() => {
				var data = JSON.stringify(res.toJSON(), null, 2);
				return FS.write(src, data);
			}).then(() => {
				return {src: src};
			});
		}
	}
}
