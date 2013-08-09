///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../../xm/iterate.ts" />
///<reference path="../../xm/io/Logger.ts" />
///<reference path="PackageJSON.ts" />
///<reference path="PackageJSON.ts" />

module tsd {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var assert = require('assert');
	var tv4:TV4 = require('tv4').tv4;

	export class Installed {

		constructor(public selector:string = null, public commit:string = null, public hash:string = null) {

		}

		public toString() {
			return this.selector;
		}
	}

	export interface InstalledMap {
		[selector: string]: Installed;
	}

	export class Config {

		public typingsPath:string = 'typings';
		public version:string = 'v4';
		public repo:string = 'borisyankov/DefinitelyTyped';
		public ref:string = 'master';

		public installed:InstalledMap = {};

		constructor() {

		}

		public get repoOwner():string {
			return this.repo.split('/')[0];
		}

		public get repoProject():string {
			return this.repo.split('/')[1];
		}

		public get repoURL():string {
			return 'http://github.com/' + this.repo;
		}

		public toJSON() {
			var json = {
				typingsPath: this.typingsPath,
				version: this.version,
				repo: this.repo,
				ref: this.ref,
				installed: {}
			};
			return json;
		}

		public static getLocal(file:string):Config {
			var cfg = new Config();
			var json:any;

			if (fs.existsSync(file)) {

				json = xm.FileUtil.readJSONSync(file);

				var schema = xm.FileUtil.readJSONSync(path.join(process.cwd(), 'schema', 'tsd-config_v4.json'));
				var res = tv4.validateResult(json, schema);

				if (!res.valid || res.missing.length > 0) {
					console.log(res.error.message);
					if (res.error.dataPath) {
						console.log(res.error.dataPath);
					}
					if (res.error.schemaPath) {
						console.log(res.error.schemaPath);
					}
					throw (new Error('malformed config: doesn\'t comply with schema'));
				}

				cfg.typingsPath = json.typingsPath;
				cfg.version = json.version;
				cfg.repo = json.repo;
				cfg.ref = json.ref;
				/*xm.reduceArray(json.installed, cfg.installed, (memo:Installed[], data:any, selector:String) => {
				 memo.push(new Installed(selector, data.commit, data.hash));
				 return memo;
				 });*/
			}
			return cfg;
		}
	}
}
