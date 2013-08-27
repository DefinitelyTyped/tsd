///<reference path="../_ref.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="../xm/io/hash.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="GithubAPICached.ts" />
///<reference path="GithubAPICachedResult.ts" />

module git {

	var async:Async = require('async');
	var _:UnderscoreStatic = require('underscore');
	var Q:QStatic = require('q');
	var assert = require('assert');
	var mkdirp = require('mkdirp');
	var fs = require('fs');
	var path = require('path');
	var FS:Qfs = require('q-io/fs');
	//TODO generalise this for re-use

	export class GithubAPICachedJSONStore {

		dir:string;
		private _formatVersion:string = '0.0.2';

		constructor(public api:git.GithubAPICached, dir:string) {
			xm.assertVar('api', api, git.GithubAPICached);
			xm.assertVar('dir', dir, 'string');

			this.dir = path.join(dir, api.getCacheKey() + '-fmt' + this._formatVersion);
		}

		init():Qpromise {
			var self:GithubAPICachedJSONStore = this;

			return FS.exists(self.dir).then((exists:bool) => {
				if (!exists) {
					return Q.nfcall(mkdirp, self.dir);
				}
				else {
					return FS.isDirectory(self.dir).then((isDir:bool) => {
						if (isDir) {
							return null;
						}
						else {
							throw new Error('is not a directory: ' + self.dir);
						}
					});
				}
			});
		}

		getResult(key:string):Qpromise {
			var self:GithubAPICachedJSONStore = this;
			var src = path.join(self.dir, GithubAPICachedResult.getHash(key) + '.json');

			return self.init().then(() => {
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
			var self:GithubAPICachedJSONStore = this;

			var src = path.join(self.dir, res.getHash() + '.json');

			return self.init().then(() => {
				var data = JSON.stringify(res.toJSON(), null, 2);
				return FS.write(src, data);
			}).then(() => {
				return {src: src};
			});
		}
	}
}
