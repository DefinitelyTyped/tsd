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
///<reference path="../../../typings/q/Q.d.ts" />

module xm {
	'use strict';

	var Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var path = require('path');
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

		private init():Q.Promise<void> {
			var defer:Q.Deferred<void> = Q.defer();

			this.stats.count('init');

			FS.exists(this._dir).then((exists:boolean) => {
				if (!exists) {
					this.stats.count('init-dir-create', this._dir);
					return xm.mkdirCheckQ(this._dir, true);
				}

				return FS.isDirectory(this._dir).then((isDir:boolean) => {
					if (isDir) {
						this.stats.count('init-dir-exists', this._dir);
						return null;
					}
					this.stats.count('init-dir-error', this._dir);
					throw new Error('is not a directory: ' + this._dir);
				});
			}).then(() => {
				defer.resolve(null);
			}, (err) => {
				this.stats.count('init-error');
				defer.reject(err);
			});

			return defer.promise;
		}

		getValue(key:string):Q.Promise<xm.CachedJSONValue> {
			var defer:Q.Deferred<xm.CachedJSONValue> = Q.defer();

			var src = path.join(this._dir, xm.CachedJSONValue.getHash(key) + '.json');
			this.stats.count('get');

			this.init().then(() => {
				return FS.exists(src);
			}).then((exists) => {
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
						defer.resolve(cached);
					});
				}
				this.stats.count('get-miss');
				defer.resolve(null);
			}).fail((err) => {
				this.stats.count('get-error');
				defer.reject(err);
			});

			return defer.promise;
		}

		storeValue(res:xm.CachedJSONValue):Q.Promise<xm.CachedJSONValue> {
			var defer:Q.Deferred<xm.CachedJSONValue> = Q.defer();

			var dest = path.join(this._dir, res.getKeyHash() + '.json');

			this.stats.count('store');

			this.init().then(() => {
				return FS.exists(dest);
			}).then((exists) => {
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
				defer.resolve(res);
			}, (err) => {
				this.stats.count('store-write-error');
				defer.reject(err);
			});

			return defer.promise;
		}
	}
}
