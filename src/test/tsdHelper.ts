/// <reference path="_ref.d.ts" />

import fs = require('graceful-fs');
import util = require('util');
import path = require('path');

import chai = require('chai');
import assert = chai.assert;

import log = require('../xm/log');
import fileIO = require('../xm/file/fileIO');
import NodeStats = require('../xm/file/NodeStats');
import CacheMode = require('../xm/http/CacheMode');
import Def = require('../tsd/data/Def');
import Const = require('../tsd/context/Const');
import Context = require('../tsd/context/Context');
import Core = require('../tsd/logic/Core');

import unordered = require('./unordered');
import helper = require('./helper');
import settings = require('./settings');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var configSchema: Object;

export function getConfigSchema(): any {
	if (!configSchema) {
		configSchema = fileIO.readJSONSync(path.join(helper.getProjectRoot(), 'schema', Const.configSchemaFile));
	}
	return configSchema;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function getFixedCacheDir(): string {
	return path.join(helper.getProjectRoot(), 'test', 'fixtures', Const.cacheDir);
}

export function getContext() {
	var context: Context;
	context = new Context();
	context.paths.cacheDir = getFixedCacheDir();
	return context;
}

export function applyCoreUpdate(core: Core) {
	core.useCacheMode(CacheMode[settings.cache]);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function listDefPaths(dir: string): Promise<string[]> {
	return fileIO.listTree(dir,(full: string, stat: NodeStats): boolean => {
		return (stat.isFile() && /\.d\.ts$/.test(full));

	}).then((paths: string[]) => {
		return paths.map((full: string) => {
			return path.relative(dir, full).replace('\\', '/');

		}).filter((short: string) => {
			return Def.isDefPath(short);
		});
	});
}
/* tslint:disable:max-line-length */
export function assertDefPathsP(actualDir: string, expectedDir: string, assertContent: boolean, message: string): Promise<void> {
	return Promise.all([
		listDefPaths(actualDir),
		listDefPaths(expectedDir)
	]).spread((actualPaths: string[], expectedPaths: string[]) => {
		assert.sameMembers(actualPaths, expectedPaths, message);

		if (assertContent) {
			log.json(actualPaths);
			log.json(expectedPaths);

			unordered.assertionLike(actualPaths, expectedPaths, (actualPath: string, expectedPath: string) => {
				return (Def.getFileFrom(actualPath) === Def.getFileFrom(expectedPath));

			}, (actualPath: string, expectedPath: string) => {
				var msg = helper.getPathMessage(actualPath, expectedPath, message);

				helper.assertBufferUTFEqual(fs.readFileSync(actualPath), fs.readFileSync(actualPath), msg);
				// helper.assertGitBufferUTFEqual(actualPath, expectedPath, msg);
			}, message);
		}
	}).return();
}
