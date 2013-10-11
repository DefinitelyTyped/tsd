///<reference path="../../_ref.d.ts" />
///<reference path="CachedLoader.ts" />
///<reference path="CachedJSONStore.ts" />
///<reference path="../ObjectUtil.ts" />

module xm {
	'use strict';

	var Q:typeof Q = require('q');
	var fs = require('fs');
	var path = require('path');
	var FS:typeof QioFS = require('q-io/fs');
	/*
	 CachedFileService: a simple flat file implementation of CachedLoaderService
	 */
	//TODO add gzip compression?
	//TODO add encoding opts
	//TODO add meta data file (with http info)
	export class CachedFileService implements xm.CachedLoaderService<NodeBuffer> {

		dir:string;
		private _extension:string = '';

		constructor(dir:string) {
			xm.assertVar('dir', dir, 'string');
			this.dir = dir;

			Object.defineProperty(this, 'dir', {writable: false});
			Object.defineProperty(this, '_extension', {writable: false, enumerable: false});
		}

		getValue(file, opts?):Q.Promise<NodeBuffer> {
			var d:Q.Deferred<NodeBuffer> = Q.defer();

			var storeFile = path.join(this.dir, file + this._extension);

			FS.exists(storeFile).then((exists) => {
				if (exists) {
					return FS.isFile(storeFile).then((isFile) => {
						if (!isFile) {
							throw(new Error('path exists but is not a file: ' + storeFile));
						}
						//read from cache
						return FS.read(storeFile, {flags: 'rb'}).then(d.resolve);
					});
				}
				d.resolve(null);
			}).fail((err) => {
				xm.log.error('CachedFileService.writeValue: failure');
				d.reject(err);
			});

			return d.promise;
		}

		writeValue(file, label:string, value:NodeBuffer, opts?):Q.Promise<NodeBuffer> {
			var d:Q.Deferred<NodeBuffer> = Q.defer();

			var storeFile = path.join(this.dir, file + this._extension);

			xm.mkdirCheckQ(path.dirname(storeFile), true).then(() => {
				return FS.write(storeFile, value, {flags: 'wb'});
			}).then(() => {
				//return same content
				d.resolve(value);
			}, (err) => {
				xm.log.error('CachedFileService.writeValue: failure');
				d.reject(err);
			});

			return d.promise;
		}
		//TODO implement getKeys()
		getKeys(opts?):Q.Promise<string[]> {
			return Q.resolve([]);
		}
	}
}

