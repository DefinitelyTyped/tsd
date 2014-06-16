/// <reference path="_ref.d.ts" />

'use strict';

import fs = require('fs');
import util = require('util');
import path = require('path');

import Promise = require('bluebird');

import chai = require('chai');
var assert = chai.assert;

import fileIO = require('../xm/file/fileIO');
import CacheMode = require('../http/CacheMode');
import Def = require('../tsd/data/Def');
import Const = require('../tsd/context/Const');
import Context = require('../tsd/context/Context');
import Core = require('../tsd/logic/Core');

import unordered = require('./unordered');
import helper = require('./helper');
import settings = require('./settings');


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function getContext() {
	var context: Context;
	context = new Context();
	context.paths.cacheDir = helper.getFixedCacheDir();
	return context;
}

export function applyCoreUpdate(core: Core) {
	core.useCacheMode(CacheMode[settings.cache]);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function listDefPaths(dir: string): Promise<string[]> {
	return fileIO.listTree(dir, (full: string, stat: fs.Stats): boolean => {
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
			console.dir(actualPaths);
			console.dir(expectedPaths);

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
