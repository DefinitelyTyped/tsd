///<reference path="../../_ref.d.ts" />
///<reference path="../KeyValueMap.ts" />
///<reference path="../StatCounter.ts" />
///<reference path="../assertVar.ts" />
///<reference path="../ObjectUtil.ts" />
///<reference path="../io/hash.ts" />
///<reference path="../io/Logger.ts" />
///<reference path="../io/FileUtil.ts" />
///<reference path="../io/mkdirCheck.ts" />
///<reference path="CachedJSONValue.ts" />

module xm {
	'use strict';

	var Q:QStatic = require('q');
	var assert = require('assert');
	var fs = require('fs');
	var path = require('path');
	var FS:Qfs = require('q-io/fs');
	/*
	 CachedJSONStore: data-store for cached json results
	 */
	//TODO consider alternate storage? not worth it?
	export class CachedJSONStore {

		stats:xm.StatCounter = new xm.StatCounter();

		private _dir:string;
		private _formatVersion:string = '0.2';

		constructor(storeFolder:string) {
			xm.assertVar('storeFolder', storeFolder, 'string');

			storeFolder = storeFolder.replace(/[\\\/]+$/, '') + '-fmt' + this._formatVersion;

			//this._dir = path.join(dir, api.getCacheKey() + '-fmt' + this._formatVersion);
			this._dir = path.resolve(storeFolder);

			this.stats.logger = xm.getLogger('CachedJSONStore');

			xm.ObjectUtil.hidePrefixed(this);
		}

		private init():Qpromise {
			this.stats.count('init');

			return FS.exists(this._dir).then((exists:bool) => {
				if (!exists) {
					this.stats.count('init-dir-create', this._dir);
					return xm.mkdirCheckQ(this._dir, true);
				}

				return FS.isDirectory(this._dir).then((isDir:bool) => {
					if (isDir) {
						this.stats.count('init-dir-exists', this._dir);
						return null;
					}
					else {
						this.stats.count('init-dir-error', this._dir);
						throw new Error('is not a directory: ' + this._dir);
					}
				});
			}).fail((err) => {
				this.stats.count('init-error');
				throw err;
			});
		}

		getValue(key:string):Qpromise {
			var src = path.join(this._dir, xm.CachedJSONValue.getHash(key) + '.json');

			this.stats.count('get');

			return this.init().then(() => {
				return FS.exists(src);
			}).then((exists:bool) => {
				if (exists) {
					this.stats.count('get-exists');

					return xm.FileUtil.readJSONPromise(src).then((json) => {
						var cached;
						try {
							cached = xm.CachedJSONValue.fromJSON(json);
						}
						catch (e) {
							this.stats.count('get-read-error');
							throw(new Error(e + ' -> ' + src));
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

		storeValue(res:xm.CachedJSONValue):Qpromise {
			var dest = path.join(this._dir, res.getKeyHash() + '.json');

			this.stats.count('store');

			return this.init().then(() => {
				return FS.exists(dest);
			}).then((exists:bool) => {
				if (exists) {
					this.stats.count('store-exists');
					return FS.remove(dest);
				}
				this.stats.count('store-new');
				return xm.mkdirCheckQ(path.dirname(dest), true);
			}).then(() => {
				this.stats.count('store-write');
				var data = JSON.stringify(res.toJSON(), null, 2);
				return FS.write(dest, data);
			}).then(() => {
				this.stats.count('store-write-success');
				return res;
			}, (err) => {
				this.stats.count('store-write-error');
				throw err;
			});
		}
	}
}
