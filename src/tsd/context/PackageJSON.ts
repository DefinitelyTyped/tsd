///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../_ref.ts" />

module tsd {

	var fs = require('fs');
	var path = require('path');

	export class PackageJSON {

		constructor(public pkg:any) {
			if (!this.pkg) {
				throw new Error('no pkg');
			}
		}

		get name():string {
			return this.pkg.name || null;
		}

		get version():string {
			return this.pkg.version || '0';
		}

		getNameVersion():string {
			return this.name + ' ' + this.version;
		}

		getKey():string {
			return this.name + '-' + this.version;
		}

		static getLocal():PackageJSON {
			var json = xm.FileUtil.readJSONSync(path.join(process.cwd(), 'package.json'));
			return new PackageJSON(json);
		}
	}
}
