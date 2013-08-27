///<reference path="../../tsd/_ref.ts" />
///<reference path="../../xm/io/FileUtil.ts" />

module xm {

	var fs = require('fs');
	var path = require('path');
	var pkginfo = require('pkginfo');

	export class PackageJSON {

		private static _local:PackageJSON;

		constructor(public pkg:any, public path?:string = null) {
			if (!this.pkg) {
				throw new Error('no pkg');
			}
		}

		get name():string {
			return this.pkg.name || null;
		}

		get description():string {
			return this.pkg.description || '';
		}

		get version():string {
			return this.pkg.version || '0.0.0';
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
