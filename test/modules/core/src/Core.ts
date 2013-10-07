///<reference path="../../../globals.ts" />
///<reference path="../../../tsdHelper.ts" />
///<reference path="../../../../src/tsd/Core.ts" />
///<reference path="../../../../src/tsd/select/Selector.ts" />

describe('Core', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var core:tsd.Core;
	var context:tsd.Context;

	before(() => {
	});
	beforeEach(() => {
		context = helper.getContext();
		context.config.log.mute = true;
		context.paths.configFile = './test/fixtures/config/default.json';
	});
	afterEach(() => {
		context = null;
		core = null;
	});

	function getCore(context:tsd.Context):tsd.Core {
		var core = new tsd.Core(context);

		helper.applyCoreUpdate(core);
		return core;
	}

	it('should be defined', () => {
		assert.isFunction(tsd.Core, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			core = getCore(null);
		});
	});

	describe('readConfig', () => {

		function testConfig(path:string):Qpromise {
			context.paths.configFile = path;
			var source = xm.FileUtil.readJSONSync(path);

			core = getCore(context);
			return core.readConfig(false).then(() => {
				helper.assertConfig(core.context.config, source, 'source data');
			});
		}

		function testInvalidConfig(path:string, exp:RegExp):Qpromise {
			context.paths.configFile = path;
			core = getCore(context);
			return assert.isRejected(core.readConfig(false), exp);
		}
		it('should load minimal config data', () => {
			return testConfig('./test/fixtures/config/default.json');
		});
		it('should load minimal config data', () => {
			return testConfig('./test/fixtures/config/valid-minimal.json');
		});

		it('should fail on missing required data', () => {
			return testInvalidConfig('./non-existing_____/tsd-json', /^cannot locate file:/);
		});
		it('should fail on bad version value', () => {
			return testInvalidConfig('./test/fixtures/config/invalid-version.json', /^malformed config:/);
		});

		it('should pass on missing optional data', () => {
			context.paths.configFile = './non-existing_____/tsd.json';
			core = getCore(context);
			return assert.isFulfilled(core.readConfig(true));
		});
	});
	describe('saveConfig', () => {
		it('should save modified data', () => {
			//copy temp for saving
			var saveFile = path.resolve(__dirname, 'save-config.json');
			fs.writeFileSync(saveFile, fs.readFileSync('./test/fixtures/config/valid.json', {encoding: 'utf8'}), {encoding: 'utf8'});
			context.paths.configFile = saveFile;

			core = getCore(context);
			//core.debug = true;

			//modify test data
			var source = xm.FileUtil.readJSONSync(saveFile);
			var changed = xm.FileUtil.readJSONSync(saveFile);
			changed.typingsPath = 'some/other/path';
			changed.installed['bleh/blah.d.ts'] = changed.installed['async/async.d.ts'];
			delete changed.installed['async/async.d.ts'];

			return core.readConfig(false).then(() => {
				helper.assertConfig(core.context.config, source, 'core.context.config');

				//modify data
				core.context.config.typingsPath = 'some/other/path';
				core.context.config.getInstalled()[0].path = 'bleh/blah.d.ts';

				return core.saveConfig();
			}).then(() => {
				assert.notIsEmptyFile(context.paths.configFile);
				return xm.FileUtil.readJSONPromise(context.paths.configFile);
			}).then((json) => {
				assert.like(json, changed, 'saved data json');
				assert.jsonSchema(json, helper.getConfigSchema(), 'saved valid json');
				return null;
			});
		});
	});

	describe('getIndex', () => {
		it('should return data', () => {
			core = getCore(context);
			//core.debug = true;

			return core.getIndex().then(() => {
				helper.assertUpdateStat(core.gitAPI.loader, 'core');

				assert.isTrue(core.index.hasIndex(), 'index.hasIndex');
				assert.operator(core.index.list.length, '>', 200, 'index.list');
				//xm.log(core.index.toDump());
				//TODO validate index data

				return null;
			});
		});
	});
});
