/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

 ///<reference path="../../_ref.ts" />
///<reference path="../io/FileUtil.ts" />
///<reference path="../assertVar.ts" />
///<reference path="../ObjectUtil.ts" />

module xm {
	'use strict';

	//TODO co-implement and ditch pkginfo dependency
	var pkginfo = require('pkginfo');

	/*
	 PackageJSON: wrap a package.json
	 */
	//TODO add typed json-pointers? (low prio)
	export class PackageJSON {

		private _pkg:any;
		private static _localPath:string;
		private static _local:PackageJSON;

		constructor(pkg:any, public path?:string = null) {
			xm.assertVar('pkg', pkg, 'object');
			this._pkg = pkg;

			xm.ObjectUtil.hidePrefixed(this);
		}

		get raw():any {
			return this._pkg;
		}

		get name():string {
			return this._pkg.name || null;
		}

		get description():string {
			return this._pkg.description || '';
		}

		get version():string {
			return this._pkg.version || '0.0.0';
		}

		getNameVersion():string {
			return this.name + ' ' + this.version;
		}

		// append version?
		getKey():string {
			return this.name + '-' + this.version;
		}

		static find():string {
			if (!PackageJSON._localPath) {
				PackageJSON._localPath = pkginfo.find((module));
			}
			return PackageJSON._localPath;
		}

		static getLocal():PackageJSON {
			if (!PackageJSON._local) {
				var src = PackageJSON.find();
				if (!src) {
					throw (new Error('cannot find local package.json'));
				}
				PackageJSON._local = new PackageJSON(xm.FileUtil.readJSONSync(src), src);
			}
			return PackageJSON._local;
		}
	}
}
