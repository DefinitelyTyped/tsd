/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import fileIO = require('../../xm/file/fileIO');
import PackageJSON = require('../../xm/data/PackageJSON');
import helper = require('../../test/helper');

import tsdHelper = require('../../test/tsdHelper');
import Paths = require('../../tsd/context/Paths');
import Context = require('../../tsd/context/Context');
import Config = require('../../tsd/context/Config');

import testConfig = require('../../test/tsd/Config');

describe('Context', () => {
	'use strict';

	describe('Paths', () => {
		it('is defined as function', () => {
			assert.isFunction(Paths);
		});
		// more in Context
	});

	describe('Context', () => {
		var ctx: Context;

		beforeEach(() => {
			ctx = new Context();
		});
		afterEach(() => {
			ctx = null;
		});

		it('is instance', () => {
			assert.isObject(ctx);
		});

		it('exports packageInfo', () => {
			assert.isObject(ctx.packageInfo, 'packageInfo');
			assert.instanceOf(ctx.packageInfo, PackageJSON, 'config');
			assert.isString(ctx.packageInfo.name, 'name');
			assert.isString(ctx.packageInfo.version, 'version');
			assert.isObject(ctx.packageInfo.raw, 'pkg');
		});
		it('exports valid paths', () => {
			assert.isObject(ctx.paths, 'paths,');
			assert.isDirectory(ctx.paths.startCwd, 'startCwd');

			/*if (fs.existsSync(ctx.paths.config)) {
			 assert.jsonSchemaFile(ctx.paths.config, configSchema, 'config');
			 }*/

			// TODO assert writability when assertion is implemented in chai-fs
		});
		it('exports config', () => {
			assert.isObject(ctx.config, 'config');
			assert.instanceOf(ctx.config, Config, 'config');
			assert.isString(ctx.config.path, 'path');
			assert.isString(ctx.config.version, 'version');
			assert.isString(ctx.config.repo, 'repo');
			assert.isString(ctx.config.ref, 'ref');
			// assert.isObject(ctx.config.installed, 'installed');
		});
		it('has valid default', () => {
			var json = fileIO.readJSONSync('./test/fixtures/config/default.json');
			testConfig.assertion(ctx.config, json, 'default');
		});
	});
});
