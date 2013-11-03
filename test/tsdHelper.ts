///<reference path="_ref.d.ts" />
///<reference path="helper.ts" />
///<reference path="../src/tsd/data/_all.ts" />

///<reference path="assert/tsd/_all.ts" />
///<reference path="assert/xm/_all.ts" />
///<reference path="assert/git/_all.ts" />

///<reference path="../src/xm/io/CachedLoader.ts" />

module helper {
	'use strict';

	var Q = require('q');
	var FS = require('q-io/fs');
	var fs = require('fs');
	var util = require('util');
	var path = require('path');

	var assert:Chai.Assert = require('chai').assert;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var configSchema;

	export function getConfigSchema():any {
		if (!configSchema) {
			configSchema = xm.FileUtil.readJSONSync(path.join(helper.getProjectRoot(), 'schema', tsd.Const.configSchemaFile));
		}
		return configSchema;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function getFixedCacheDir():string {
		return path.join(helper.getProjectRoot(), 'test', 'fixtures', tsd.Const.cacheDir);
	}

	export function getContext() {
		var context:tsd.Context;
		context = new tsd.Context();
		context.paths.cacheDir = getFixedCacheDir();
		return context;
	}

	export class TestInfo {
		name:string;
		group:string;

		tmpDir:string;
		fixturesDir:string;
		typingsDir:string;

		cacheDirTestFixed:string;
		cacheDirDev:string;
		cacheDirUser:string;

		configFile:string;
		resultFile:string;
		errorFile:string;
		stdoutFile:string;
		stderrFile:string;

		testDump:string;
		selectorDump:string;
		argsDump:string;

		resultExpect:string;
		configExpect:string;
		errorExpect:string;
		stdoutExpect:string;
		stderrExpect:string;
		typingsExpect:string;

		modBuildDir:string;
		modBuildAPI:string;
		modBuildCLI:string;
	}

	export function getTestInfo(group:string, name:string, test, createConfigFile:boolean = true):TestInfo {

		var tmpDir = path.join(__dirname, 'result', group, name);
		var dumpDir = path.resolve(tmpDir, 'dump');
		var fixturesDir = path.resolve(__dirname, '..', 'fixtures', 'expected', group, name);
		var modBuildDir = path.resolve(__dirname, '..', '..', '..', '..', 'build');

		if (test.fixtures) {
			fixturesDir = path.resolve(fixturesDir, '..', test.fixtures);
		}

		xm.FileUtil.mkdirCheckSync(tmpDir, true);
		xm.FileUtil.mkdirCheckSync(modBuildDir, true);

		var info = new TestInfo();
		info.name = name;
		info.group = group;

		info.tmpDir = tmpDir;
		info.fixturesDir = fixturesDir;
		info.typingsDir = path.join(tmpDir, 'typings');

		info.cacheDirTestFixed = getFixedCacheDir();
		info.cacheDirDev = path.join(helper.getProjectRoot(), tsd.Const.cacheDir);
		info.cacheDirUser = tsd.Paths.getUserCacheDir();

		info.configFile = path.join(tmpDir, tsd.Const.configFile);
		info.resultFile = path.join(tmpDir, 'result.json');
		info.errorFile = path.join(tmpDir, 'error.json');
		info.stdoutFile = path.join(tmpDir, 'stdout.txt');
		info.stderrFile = path.join(tmpDir, 'stderr.txt');

		info.configExpect = path.join(fixturesDir, tsd.Const.configFile);
		info.resultExpect = path.join(fixturesDir, 'result.json');
		info.errorExpect = path.join(fixturesDir, 'error.json');
		info.stdoutExpect = path.join(fixturesDir, 'stdout.txt');
		info.stderrExpect = path.join(fixturesDir, 'stderr.txt');
		info.typingsExpect = path.join(fixturesDir, 'typings');

		info.testDump = path.join(dumpDir, 'test.json');
		info.argsDump = path.join(dumpDir, 'args.json');
		info.selectorDump = path.join(dumpDir, 'selector.json');

		info.modBuildDir = modBuildDir;
		//TODO decide to assert these?
		info.modBuildAPI = path.join(modBuildDir, 'api.js');
		info.modBuildCLI = path.join(modBuildDir, 'cli.js');

		if (createConfigFile) {
			fs.writeFileSync(info.configFile, fs.readFileSync('./test/fixtures/config/default.json', {encoding: 'utf8'}), {encoding: 'utf8'});
		}
		return info;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function listDefPaths(dir:string):Q.Promise<string[]> {
		var d:Q.Deferred<string[]> = Q.defer();

		FS.listTree(dir, (full:string, stat):boolean => {
			return (stat.isFile() && /\.d\.ts$/.test(full));

		}).then((paths:string[]) => {
			d.resolve(paths.map((full:string) => {
				return path.relative(dir, full).replace('\\', '/');

			}).filter((short:string) => {
				return tsd.Def.isDefPath(short);
			}));
		}).fail(d.reject);

		return d.promise;
	}

	export function assertDefPathsP(actualDir:string, expectedDir:string, assertContent:boolean, message:string):Q.Promise<void> {
		var d:Q.Deferred<void> = Q.defer();

		Q.all([helper.listDefPaths(actualDir), helper.listDefPaths(expectedDir)]).spread((actualPaths, expectedPaths) => {
			assert.sameMembers(actualPaths, expectedPaths, message);

			if (assertContent) {
				xm.log.json(actualPaths);
				xm.log.json(expectedPaths);

				helper.assertUnorderedLike(actualPaths, expectedPaths, (actualPath, expectedPath) => {
					xm.log('match', tsd.Def.getFileFrom(actualPath), tsd.Def.getFileFrom(expectedPath));
					return (tsd.Def.getFileFrom(actualPath) === tsd.Def.getFileFrom(expectedPath));

				}, (actualPath, expectedPath) => {

					xm.log('assert', actualPath, expectedPath);
					var msg = helper.getPathMessage(actualPath, expectedPath, message);

					helper.assertBufferUTFEqual(fs.readfile(actualPath), fs.readfile(actualPath), msg);
					//helper.assertGitBufferUTFEqual(actualPath, expectedPath, msg);
				}, message);
			}
			d.resolve();
		});

		return d.promise;
	}
}
