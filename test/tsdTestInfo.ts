/// <reference path="_ref.d.ts" />
/// <reference path="helper.ts" />
/// <reference path="tsdHelper.ts" />

module helper {
	'use strict';

	var fs = require('fs');
	var util = require('util');
	var path = require('path');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export class TestInfo {

		name:string;
		group:string;

		tmpDir:string;
		dumpDir:string;

		fixturesDir:string;
		modBuildDir:string;

		constructor(group:string, name:string, test:any, createConfigFile:boolean = true) {
			xm.assertVar(group, 'string', 'group');
			xm.assertVar(name, 'string', 'name');
			xm.assertVar(test, 'object', 'test');

			this.name = name;
			this.group = group;

			this.tmpDir = path.join(__dirname, 'result', this.group, this.name);
			this.dumpDir = path.resolve(this.tmpDir, 'dump');
			this.fixturesDir = path.resolve(__dirname, '..', 'fixtures', 'expected', this.group, this.name);
			this.modBuildDir = path.resolve(__dirname, '..', '..', '..', '..', 'build');

			if (test.fixtures) {
				this.fixturesDir = path.resolve(this.fixturesDir, '..', test.fixtures);
			}

			xm.file.mkdirCheckSync(this.tmpDir, true);
			xm.file.mkdirCheckSync(this.modBuildDir, true);

			if (createConfigFile) {
				fs.writeFileSync(this.configFile, fs.readFileSync('./test/fixtures/config/default.json', {encoding: 'utf8'}), {encoding: 'utf8'});
			}
		}

		get cacheDirTestFixed():string {
			return helper.getFixedCacheDir();
		}

		get typingsDir():string {
			return path.join(this.tmpDir, 'typings');
		}

		get cacheDirDev():string {
			return path.join(helper.getProjectRoot(), tsd.Const.cacheDir);
		}

		get cacheDirUser():string {
			return tsd.Paths.getUserCacheDir();
		}

		get configFile():string {
			return path.join(this.tmpDir, tsd.Const.configFile);
		}

		get resultFile():string {
			return path.join(this.tmpDir, 'result.json');
		}

		get errorFile():string {
			return path.join(this.tmpDir, 'error.json');
		}

		get stdoutFile():string {
			return path.join(this.tmpDir, 'stdout.txt');
		}

		get stderrFile():string {
			return path.join(this.tmpDir, 'stderr.txt');
		}

		get configExpect():string {
			return path.join(this.fixturesDir, tsd.Const.configFile);
		}

		get resultExpect():string {
			return path.join(this.fixturesDir, 'result.json');
		}

		get errorExpect():string {
			return path.join(this.fixturesDir, 'error.json');
		}

		get stdoutExpect():string {
			return path.join(this.fixturesDir, 'stdout.txt');
		}

		get stderrExpect():string {
			return path.join(this.fixturesDir, 'stderr.txt');
		}

		get typingsExpect():string {
			return path.join(this.fixturesDir, 'typings');
		}

		get testDump():string {
			return path.join(this.dumpDir, 'test.json');
		}

		get argsDump():string {
			return path.join(this.dumpDir, 'args.json');
		}

		get queryDump():string {
			return path.join(this.dumpDir, 'query.json');
		}

		get optionsDump():string {
			return path.join(this.dumpDir, 'options.json');
		}

		get modBuildAPI():string {
			return path.join(this.modBuildDir, 'api.js');
		}

		get modBuildCLI():string {
			return path.join(this.modBuildDir, 'cli.js');
		}
	}
}
