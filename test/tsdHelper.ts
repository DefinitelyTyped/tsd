///<reference path="_ref.d.ts" />
///<reference path="helper.ts" />
///<reference path="../src/tsd/data/_all.ts" />

///<reference path="assert/tsd/_all.ts" />
///<reference path="assert/xm/_all.ts" />

///<reference path="../src/xm/io/CachedLoader.ts" />

module helper {
	'use strict';

	var fs = require('fs');
	var util = require('util');
	var assert:Chai.Assert = require('chai').assert;
	var q = require('q');
	var FS = require('q-io/fs');

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var configSchema;

	export function getConfigSchema() {
		if (!configSchema) {
			configSchema = xm.FileUtil.readJSONSync(path.join(helper.getProjectRoot(), 'schema', tsd.Const.configSchemaFile));
		}
		return configSchema;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function pad(num:number, len:number):string {
		var ret = num.toString(10);
		while (ret.length < len) {
			ret = '0' + ret;
		}
		return ret;
	}

	export function getCacheDir():string {
		return path.join(helper.getProjectRoot(), 'test', 'fixtures', tsd.Const.cacheDir);
	}

	export function getContext() {
		var context:tsd.Context;
		context = new tsd.Context();
		context.paths.cacheDir = getCacheDir();
		return context;
	}

	export class TestInfo {
		name:string;
		group:string;

		tmpDir:string;
		fixturesDir:string;
		typingsDir:string;

		configFile:string;
		resultFile:string;

		testDump:string;
		selectorDump:string;

		resultExpect:string;
		configExpect:string;
	}

	export function getTestInfo(group:string, name:string, createConfigFile:boolean = true):TestInfo {

		var tmpDir = path.join(__dirname, 'result', group, name);
		var dumpDir = path.resolve(tmpDir, 'dump');
		var fixturesDir = path.resolve(__dirname, '..', 'fixtures', 'expected', group, name);

		xm.mkdirCheckSync(tmpDir, true);

		var info = new TestInfo();
		info.name = name;
		info.group = group;

		info.tmpDir = tmpDir;
		info.fixturesDir = fixturesDir;
		info.typingsDir = path.join(tmpDir, 'typings');

		info.configFile = path.join(tmpDir, tsd.Const.configFile);
		info.resultFile = path.join(tmpDir, 'result.json');

		info.testDump = path.join(dumpDir, 'test.json');
		info.selectorDump = path.join(dumpDir, 'selector.json');

		info.configExpect = path.join(fixturesDir, tsd.Const.configFile);
		info.resultExpect = path.join(fixturesDir, 'result.json');

		if (createConfigFile) {
			fs.writeFileSync(info.configFile, fs.readFileSync('./test/fixtures/config/default.json', {encoding: 'utf8'}), {encoding: 'utf8'});
		}
		return info;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function applyCoreUpdate(core:tsd.Core) {
		applyCoreUpdateLoader(core.gitAPI.loader);
		applyCoreUpdateLoader(core.gitRaw.loader);
	}

	//set modes for fixture updates
	function applyCoreUpdateLoader(loader:xm.CachedLoader<any>) {
		var opts = loader.options;
		if (helper.settings.cache.forceUpdate) {
			opts.cacheRead = false;
			opts.remoteRead = true;
			opts.cacheWrite = true;
		}
		else if (helper.settings.cache.allowUpdate) {
			opts.cacheRead = true;
			opts.remoteRead = true;
			opts.cacheWrite = true;
		}
		else {
			opts.cacheRead = true;
			opts.remoteRead = false;
			opts.cacheWrite = false;
		}
	}

	export function assertUpdateStat(loader:xm.CachedLoader<any>, message:string) {
		var stats = loader.stats;
		if (helper.settings.cache.forceUpdate) {
			assert.operator(stats.get('cache-hit'), '===', 0, message + ': forceUpdate: cache-hit');
			assert.operator(stats.get('load-start'), '>=', 0, message + ': forceUpdate: load-start');
			assert.operator(stats.get('write-succes'), '>=', 0, message + ': forceUpdate: write-succes');
		}
		else if (helper.settings.cache.allowUpdate) {
			//assert.operator(stats.get('cache-hit'), '>=', 0, message + ': allowUpdate: cache-hit');
			//assert.operator(stats.get('load-start'), '>=', 0, message + ': allowUpdate: load-start');
			//assert.operator(stats.get('write-succes'), '>=', 0, message + ': allowUpdate: write-succes');

			var sum = stats.get('load-start') + stats.get('write-succes') + stats.get('cache-hit');
			assert.operator(sum, '>', 0, message + ': allowUpdate: sum');
		}
		else {
			assert.operator(stats.get('cache-hit'), '>', 0, message + ': noUpdate: cache-hit');
			assert.operator(stats.get('load-start'), '===', 0, message + ': noUpdate: load-start');
			assert.operator(stats.get('write-succes'), '===', 0, message + ': noUpdate: write-succes');
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function listDefPaths(dir:string):Q.Promise<string[]> {
		var d:Q.Deferred<string[]> = Q.defer();

		FS.listTree(dir,(full:string, stat):boolean => {
			return (stat.isFile() && /\.d\.ts$/.test(full));

		}).then((paths:string[]) => {
			d.resolve(paths.map((full:string) => {
				return path.relative(dir, full).replace('\\', '/');

			}).filter((short:string) => {
				return tsd.Def.isDefPath(short);
			}));
		});

		return d.promise;
	}
}
