/// <reference path="../_ref.d.ts" />

var Q = require('q');
var fs = require('fs');
var util = require('util');
var path = require('path');

var assert: Chai.Assert = require('chai').assert;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var configSchema: Object;

export function getConfigSchema(): any {
	if (!configSchema) {
		configSchema = xm.file.readJSONSync(path.join(helper.getProjectRoot(), 'schema', tsd.Const.configSchemaFile));
	}
	return configSchema;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function getFixedCacheDir(): string {
	return path.join(helper.getProjectRoot(), 'test', 'fixtures', tsd.Const.cacheDir);
}

export function getContext() {
	var context: tsd.Context;
	context = new tsd.Context();
	context.paths.cacheDir = getFixedCacheDir();
	return context;
}

export function applyCoreUpdate(core: tsd.Core) {
	core.useCacheMode(xm.http.CacheMode[helper.settings.cache]);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function listDefPaths(dir: string): Promise<string[]> {
	var d = Promise.defer<string[]>();

	xm.file.listTree(dir,(full: string, stat: xm.NodeStats): boolean => {
		return (stat.isFile() && /\.d\.ts$/.test(full));

	}).then((paths: string[]) => {
		d.resolve(paths.map((full: string) => {
			return path.relative(dir, full).replace('\\', '/');

		}).filter((short: string) => {
			return tsd.Def.isDefPath(short);
		}));
	}).catch(d.reject);

	return d.promise;
}

export function assertDefPathsP(actualDir: string, expectedDir: string, assertContent: boolean, message: string): Promise<void> {
	var d = Promise.defer<void>();

	Promise.all([helper.listDefPaths(actualDir), helper.listDefPaths(expectedDir)]).spread((actualPaths: string[], expectedPaths: string[]) => {
		assert.sameMembers(actualPaths, expectedPaths, message);

		if (assertContent) {
			xm.log.json(actualPaths);
			xm.log.json(expectedPaths);

			helper.assertUnorderedLike(actualPaths, expectedPaths, (actualPath: string, expectedPath: string) => {
				return (tsd.Def.getFileFrom(actualPath) === tsd.Def.getFileFrom(expectedPath));

			}, (actualPath: string, expectedPath: string) => {
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
