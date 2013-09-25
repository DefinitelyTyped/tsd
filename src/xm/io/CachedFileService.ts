///<reference path="../../_ref.d.ts" />
///<reference path="CachedLoader.ts" />
///<reference path="CachedJSONStore.ts" />
///<reference path="../ObjectUtil.ts" />

module xm {
	'use strict';

	var Q:QStatic = require('q');
	var fs = require('fs');
	var path = require('path');
	var FS:Qfs = require('q-io/fs');
	/*
	 CachedFileService: a simple flat file implementation of CachedLoaderService
	 */
	//TODO add gzip compression?
	//TODO add encoding opts
	export class CachedFileService implements xm.CachedLoaderService {

		_dir:string;

		constructor(dir:string) {
			xm.assertVar('dir', dir, 'string');
			this._dir = dir;

			xm.ObjectUtil.hidePrefixed(this);
		}

		getValue(file, opts?):Qpromise {
			var storeFile = path.join(this._dir, file);
			return FS.exists(storeFile).then((exists:bool) => {
				if (exists) {
					return FS.isFile(storeFile).then((isFile:bool) => {
						if (!isFile) {
							throw(new Error('path exists but is not a file: ' + storeFile));
						}
						//read from cache
						return FS.read(storeFile);
					});
				}
				return null;
			});
		}

		writeValue(file, label:string, value:any, opts?):Qpromise {
			var storeFile = path.join(this._dir, file);
			return xm.mkdirCheckQ(path.dirname(storeFile), true).then(() => {
				return FS.write(storeFile, value);
			}).then(() => {
				return value;
			}, (err) => {
				//TODO whut2do?
				//throw(err);
				//still return data?
				return value;
			});
		}

		getKeys(opts?):Qpromise {
			return Q([]);
		}

		get dir():string {
			return this._dir;
		}
	}
}
