///<reference path="../../tsd/_ref.ts" />
///<reference path="../../xm/io/FileUtil.ts" />

module xm {

	var pkginfo = require('pkginfo');

	/*
	 PackageJSON: wrap a package.json
	 */
	//TODO add typed json-pointers? (low prio)
	export class PackageJSON {

		private _pkg:any;
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
			return pkginfo.find((module));
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
