///<reference path="../_ref.ts" />

///<reference path="../../src/tsd/context/Context.ts" />
///<reference path="../../src/tsd/context/Paths.ts" />
///<reference path="../../src/tsd/context/Config.ts" />
///<reference path="../../src/tsd/context/PackageJSON.ts" />

describe('Context', function () {

	var fs = require('fs');
	var path = require('path');
	var rimraf = require('rimraf');

	var _:UnderscoreStatic = <UnderscoreStatic>require('underscore');


	describe('Paths', () => {
		var paths:tsd.Paths;
		it('is defined as function', () => {
			assert.isFunction(tsd.Paths);
		});
		//more in Context
	});

	describe('Config', () => {
		var cfg:tsd.Config;
		it('is defined as function', () => {
			assert.isFunction(tsd.Config);
		});
		//more in Context
	});

	describe('PackageJSON', () => {
		var info:tsd.PackageJSON;
		it('is defined as function', () => {
			assert.isFunction(tsd.PackageJSON);
		});
		describe('local', () => {
			it('should return instance', () => {
				info = tsd.PackageJSON.getLocal();
				assert.isObject(info, 'info');
			});
			it('should have properties', () => {
				assert.isString(info.name, 'name');
				assert.isString(info.version, 'version');
				assert.isObject(info.pkg, 'pkg');
			});
		});
		//more in Context
	});

	describe('Context', () => {

		it('is defined as function', () => {
			assert.isFunction(tsd.Context);
		});

		describe('default', () => {

			var ctx:tsd.Context;
			var configSchema:any;

			before(() => {
				configSchema = xm.FileUtil.readJSONSync('schema/tsd-config_v4.json');
				ctx = new tsd.Context();
			});
			it('is instance', () => {
				assert.ok(ctx);
			});
			it('exports packageInfo', () => {
				assert.isObject(ctx.packageInfo, 'packageInfo');
				assert.isString(ctx.packageInfo.name, 'name');
				assert.isString(ctx.packageInfo.version, 'version');
				assert.isObject(ctx.packageInfo.pkg, 'pkg');
			});
			it('exports valid paths', () => {
				assert.isObject(ctx.paths, 'paths,');
				assert.isDirectory(ctx.paths.tmp, 'tmp');
				assert.isDirectory(ctx.paths.typings, 'typings');
				assert.isDirectory(ctx.paths.cache, 'cache');

				// not enforced
				assert.isString(ctx.paths.config, 'config');

				if (fs.existsSync(ctx.paths.config)) {
					assert.jsonSchemaFile(ctx.paths.config, configSchema, 'config');
				}

				// TODO assert writability when assertion is implemented in chai-fs
			});
			it('exports config', () => {
				assert.isObject(ctx.config, 'config');
				assert.isString(ctx.config.typingsPath, 'typingsPath');
				assert.isString(ctx.config.version, 'version');
				assert.isString(ctx.config.repo, 'repo');
				assert.isString(ctx.config.ref, 'ref');
				assert.isObject(ctx.config.installed, 'installed');
			});
			it('exports valid formed config json', () => {
				assert.jsonSchema(ctx.config.toJSON(), configSchema, 'toJSON');
			});
		});
	});
});
