///<reference path="../../../globals.ts" />
///<reference path="../../../tsdHelper.ts" />

///<reference path="../../../../src/tsd/context/Context.ts" />

describe('Context', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	describe('Paths', () => {
		it('is defined as function', () => {
			assert.isFunction(tsd.Paths);
		});
		//more in Context
	});

	describe('Context', () => {
		var ctx:tsd.Context;

		beforeEach(() => {
			ctx = new tsd.Context();
		});
		afterEach(() => {
			ctx = null;
		});

		it('is instance', () => {
			assert.isObject(ctx);
		});

		it('exports packageInfo', () => {
			assert.isObject(ctx.packageInfo, 'packageInfo');
			assert.instanceOf(ctx.packageInfo, xm.PackageJSON, 'config');
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
			assert.instanceOf(ctx.config, tsd.Config, 'config');
			assert.isString(ctx.config.typingsPath, 'typingsPath');
			assert.isString(ctx.config.version, 'version');
			assert.isString(ctx.config.repo, 'repo');
			assert.isString(ctx.config.ref, 'ref');
			//assert.isObject(ctx.config.installed, 'installed');
		});
		it('has valid default', () => {
			var json = xm.FileUtil.readJSONSync('./test/fixtures/config/default.json');
			helper.assertConfig(ctx.config, json, 'default');
		});
	});
});
