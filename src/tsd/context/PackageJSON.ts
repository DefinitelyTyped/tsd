///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../_ref.ts" />

module tsd {

	var fs = require('fs');
	var path = require('path');

	export class PackageJSON {

		constructor(public pkg:any) {
			if (!this.pkg) throw new Error('no pkg');
		}

		public get name():string {
			return this.pkg.name || null;
		}

		public get version():string {
			return this.pkg.version || '0';
		}

		public getNameVersion():string {
			return this.name + ' ' + this.version
		}

		public getKey():string {
			return this.name + '-' + this.version
		}

		public static getLocal():PackageJSON {
			var json = xm.FileUtil.readJSONSync(path.join(process.cwd(), 'package.json'));
			return new PackageJSON(json);
		}
	}
}
