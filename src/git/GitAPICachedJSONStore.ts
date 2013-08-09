///<reference path="../_ref.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/io/hash.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="GitAPICached.ts" />
///<reference path="GitAPICachedResult.ts" />

module git {

	var async:Async = require('async');
	var _:UnderscoreStatic = require('underscore');
	var assert = require('assert');
	var mkdirp = require('mkdirp');
	var fs = require('fs');
	var path = require('path');

	export class GitAPICachedJSONStore {

		dir:string;

		constructor(public api:GitAPICached, dir:string) {
			this.dir = path.join(dir, api.getCacheKey());
		}

		init(callback:(err) => void) {
			var self:GitAPICachedJSONStore = this;

			fs.exists(self.dir, (exists:bool) => {
				if (!exists) {
					mkdirp(self.dir, (err) => {
						if (err) {
							return callback('cannot create dir: ' + self.dir + ': ' + err);
						}
						return callback(null);
					});
				}
				else {
					fs.stat(self.dir, (err, stats) => {
						if (!stats.isDirectory()) {
							return callback('is not a directory: ' + self.dir);
						}
						return callback(null);
					});
				}
			});
		}

		getResult(key:string, callback:(err, res:GitAPICachedResult) => void) {
			var self:GitAPICachedJSONStore = this;

			self.init((err) => {
				if (err) {
					return callback(err, null);
				}

				var src = path.join(self.dir, GitAPICachedResult.getHash(key) + '.json');

				fs.exists(src, (exists:bool) => {
					if (!exists) {
						return callback(null, null);
					}

					xm.FileUtil.readJSON(src, (err, json) => {
						if (err) {
							return callback(err, null);
						}
						var cached;
						try {
							cached = GitAPICachedResult.fromJSON(json);
						}
						catch (e) {
							return callback(src + ':' + e, null);
						}
						callback(null, cached);
					});
				});
			});
		}

		storeResult(res:GitAPICachedResult, callback:(err, info) => void) {
			var self:GitAPICachedJSONStore = this;

			self.init((err) => {
				if (err) {
					return callback(err, null);
				}
				var src = path.join(self.dir, GitAPICachedResult.getHash(res.key) + '.json');
				var data = JSON.stringify(res.toJSON(), null, 2);

				fs.writeFile(src, data, (err) => {
					callback(err, {src: src});
				});
			});
		}
	}
}