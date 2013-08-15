///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../../xm/iterate.ts" />
///<reference path="../../xm/io/Logger.ts" />
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

		toString() {
			return this.selector;
		}
	}

	export interface InstalledMap {
		[selector: string]: Installed;
	}

	export class Config {

		typingsPath:string = 'typings';
		version:string = 'v4';
		repo:string = 'borisyankov/DefinitelyTyped';
		ref:string = 'master';

		installed:InstalledMap = {};

		constructor() {

		}

		get repoOwner():string {
			return this.repo.split('/')[0];
		}

		get repoProject():string {
			return this.repo.split('/')[1];
		}

		get repoURL():string {
			return 'http://github.com/' + this.repo;
		}

		toJSON() {
			var json = {
				typingsPath: this.typingsPath,
				version: this.version,
				repo: this.repo,
				ref: this.ref,
				installed: {}
			};
			return json;
		}

		static getLocal(file:string):Config {
			xm.assertVar('file', file, 'string');

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
