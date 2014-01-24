/// <reference path="_ref.d.ts" />
/// <reference path="helper.ts" />
/// <reference path="../src/xm/http/CacheMode.ts" />
/// <reference path="../src/tsd/data/_all.ts" />
/// <reference path="../src/xm/childProcess.ts" />

/// <reference path="assert/tsd/_all.ts" />
/// <reference path="assert/xm/_all.ts" />
/// <reference path="assert/git/_all.ts" />
/// <reference path="tsdTestInfo.ts" />

module helper {
	'use strict';

	var Q = require('q');
	var FS = require('q-io/fs');
	var fs = require('fs');
	var util = require('util');
	var path = require('path');

	var assert:Chai.Assert = require('chai').assert;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var configSchema:Object;

	export function getConfigSchema():any {
		if (!configSchema) {
			configSchema = xm.file.readJSONSync(path.join(helper.getProjectRoot(), 'schema', tsd.Const.configSchemaFile));
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

	export function applyCoreUpdate(core:tsd.Core) {
		core.useCacheMode(xm.http.CacheMode[helper.settings.cache]);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function listDefPaths(dir:string):Q.Promise<string[]> {
		var d:Q.Deferred<string[]> = Q.defer();

		FS.listTree(dir, (full:string, stat:QioFS.Stats):boolean => {
			return (stat.node.isFile() && /\.d\.ts$/.test(full));

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

		Q.all([helper.listDefPaths(actualDir), helper.listDefPaths(expectedDir)]).spread((actualPaths:string[], expectedPaths:string[]) => {
			assert.sameMembers(actualPaths, expectedPaths, message);

			if (assertContent) {
				xm.log.json(actualPaths);
				xm.log.json(expectedPaths);

				helper.assertUnorderedLike(actualPaths, expectedPaths, (actualPath:string, expectedPath:string) => {
					return (tsd.Def.getFileFrom(actualPath) === tsd.Def.getFileFrom(expectedPath));

				}, (actualPath:string, expectedPath:string) => {
					var msg = helper.getPathMessage(actualPath, expectedPath, message);

					helper.assertBufferUTFEqual(fs.readfile(actualPath), fs.readfile(actualPath), msg);
					// helper.assertGitBufferUTFEqual(actualPath, expectedPath, msg);
				}, message);
			}
		}).then(() => {
			d.resolve();
		});

		return d.promise;
	}
}
