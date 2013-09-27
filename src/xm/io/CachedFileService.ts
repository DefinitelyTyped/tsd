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

		private dir:string;

		constructor(dir:string) {
			xm.assertVar('dir', dir, 'string');
			this.dir = dir;

			Object.defineProperty(this, 'dir', {writable: false});
		}

		getValue(file, opts?):Qpromise {
			var storeFile = path.join(this.dir, file);

			return FS.exists(storeFile).then((exists:boolean) => {
				if (exists) {
					return FS.isFile(storeFile).then((isFile:boolean) => {
						if (!isFile) {
							throw(new Error('path exists but is not a file: ' + storeFile));
						}
						//read from cache
						return FS.read(storeFile, {flags: 'rb'});
					});
				}
				return null;
			});
		}

		writeValue(file, label:string, value:any, opts?):Qpromise {
			var storeFile = path.join(this.dir, file);

			return xm.mkdirCheckQ(path.dirname(storeFile), true).then(() => {
				return FS.write(storeFile, value, {flags: 'wb'});
			}).then(() => {
				return value;
			}, (err) => {
				xm.log.error('CachedFileService.writeValue: failure');
				throw(err);
			});
		}

		getKeys(opts?):Qpromise {
			return Q([]);
		}
	}
}
