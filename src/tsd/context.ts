///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/iterate.ts" />

module tsd {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var assert = require('assert');
	var mkdirp = require('mkdirp');
	var tv4:TV4 = require('tv4').tv4;

	export class Context {

		public packageInfo:PackageInfo;
		public paths:Paths;
		public config:Config;

		constructor(configPath:string=null) {
			this.packageInfo = PackageInfo.getLocal();
			this.paths = new Paths(this.packageInfo);
			this.config = Config.getLocal(configPath || this.paths.config);

			this.paths.setTypings(this.config.typingsPath);
		}
	}

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
		public version:string = 'v3';
		public repo:string = 'borisyankov/DefinitelyTyped';
		public ref:string = 'master';

		public installed:InstalledMap = {};

		constructor() {

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


	export class Paths {

		public tmp:string;
		public typings:string;
		public cache:string;
		public config:string;

		constructor(info:PackageInfo) {
			assert.ok(info, 'info');

			this.tmp = Paths.findTmpDir(info);
			this.cache = path.join(process.cwd(), 'tsd');
			mkdirp.sync(this.cache);

			this.typings = path.join(process.cwd(), 'typings');
			this.config = path.join(process.cwd(), 'tsd-config.json');
		}

		public setTypings(dir:string):void {
			if (fs.existsSync(dir)) {
				if (!fs.statSync(dir).isDirectory()) {
					throw (new Error('path exists but is not a directory: ' + dir));
				}
			}
			else {
				this.typings = dir;
				mkdirp.sync(dir);
			}
		}

		public static findTmpDir(info:PackageInfo):string {
			var now = Date.now();
			var candidateTmpDirs = [
				process.env['TMPDIR'] || '/tmp',
				info.pkg.tmp,
				path.join(process.cwd(), 'tmp')
			];

			for (var i = 0; i < candidateTmpDirs.length; i++) {
				var candidatePath = path.join(candidateTmpDirs[i], 'phantomjs');

				try {
					mkdirp.sync(candidatePath, '0777');
					var testFile = path.join(candidatePath, now + '.tmp');
					fs.writeFileSync(testFile, 'test');
					fs.unlinkSync(testFile);
					return candidatePath
				} catch (e) {
					console.log(candidatePath, 'is not writable:', e.message);
				}
			}
			throw (new Error('can not find a writable tmp directory.'));
		}
	}


	export class PackageInfo {
		constructor(public name:string, public version:string, public pkg:any) {
			if (!this.name) throw new Error('no name');
			if (!this.version) throw new Error('no version');
			if (!this.pkg) throw new Error('no pkg');
		}

		public getNameVersion():string {
			return this.name + ' ' + this.version
		}

		public static getLocal():PackageInfo {
			var json = xm.FileUtil.readJSONSync(path.join(process.cwd(), 'package.json'));
			return new PackageInfo(json.name, json.version, json);
		}
	}
}
