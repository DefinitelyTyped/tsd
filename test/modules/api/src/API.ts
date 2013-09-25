///<reference path="../../../globals.ts" />
///<reference path="../../../tsdHelper.ts" />
///<reference path="../../../../src/tsd/API.ts" />
///<reference path="../../../../src/tsd/select/Selector.ts" />
///<reference path="../../../../src/xm/io/hash.ts" />

describe('API', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var FS:Qfs = require('q-io/fs');
	var assert:Chai.Assert = require('chai').assert;

	var api:tsd.API;
	var context:tsd.Context;

	before(() => {

	});
	beforeEach(() => {
		context = helper.getContext();
		context.log.mute = true;
		context.config.log.mute = true;
	});
	afterEach(() => {
		context = null;
		api = null;
	});

	it('should be defined', () => {
		assert.isFunction(tsd.API, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			api = new tsd.API(null);
		});
	});

	function getAPI(context:tsd.Context):tsd.API {
		var api = new tsd.API(context);

		helper.applyCoreUpdate(api.core);
		return api;
	}

	function applyMute(mute:boolean) {
		api.core.debug = !mute;
		api.context.log.mute = mute;
		api.context.config.log.mute = mute;
	}

	function applyTempInfo(group:string, name:string, test:any, selector:tsd.Selector):helper.TestInfo {
		var tmp = helper.getTestInfo(group, name, true);

		api.context.paths.configFile = tmp.configFile;
		api.context.config.typingsPath = tmp.typingsDir;

		xm.FileUtil.writeJSONSync(tmp.testDump, test);
		xm.FileUtil.writeJSONSync(tmp.selectorDump, selector);

		applyMute(!test.debug);

		return tmp;
	}

	function getSelector(json) {
		assert.property(json, 'pattern');
		var selector = new tsd.Selector(json.pattern);
		return selector;
	}

	describe('search', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'search'));
		xm.eachProp(data.tests, (test, name) => {
			var selector = getSelector(test.selector);

			it('selector "' + name + '"', () => {
				api = getAPI(context);

				var info = applyTempInfo('search', name, data, selector);

				return api.search(selector).then((result:tsd.APIResult) => {
					helper.assertUpdateStat(api.core.gitAPI.loader, 'api');

					xm.FileUtil.writeJSONSync(info.resultFile, helper.serialiseAPIResult(result));

					var resultExpect = xm.FileUtil.readJSONSync(info.resultExpect);
					helper.assertAPIResult(result, resultExpect, 'resultActual');
				});
			});
		});
	});

	describe('install', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'install'));

		xm.eachProp(data.tests, (test, name) => {
			var selector = getSelector(test.selector);

			it('selector "' + name + '"', () => {
				api = getAPI(context);

				var info = applyTempInfo('install', name, test, selector);

				return api.install(selector).then((result:tsd.APIResult) => {
					helper.assertUpdateStat(api.core.gitAPI.loader, 'api');
					helper.assertUpdateStat(api.core.gitRaw.loader, 'raw');

					xm.FileUtil.writeJSONSync(info.resultFile, helper.serialiseAPIResult(result));

					var resultExpect = xm.FileUtil.readJSONSync(info.resultExpect);
					helper.assertAPIResult(result, resultExpect, 'result');

					var configExpect = xm.FileUtil.readJSONSync(info.configExpect);
					var configActual = xm.FileUtil.readJSONSync(info.configFile);
					configExpect.typingsPath = info.typingsDir;
					assert.deepEqual(configActual, configExpect, 'configActual');

					helper.assertConfig(api.context.config, configExpect, 'api.context.config');

					//set for correct comparison
					return helper.listDefPaths(info.typingsDir).then((typings) => {
						assert.sameMembers(typings, Object.keys(configExpect.installed), 'installed file');

						return Q.all(typings.map((ref:string) => {
							assert.notIsEmptyFile(path.join(info.typingsDir, ref), 'typing');
							/*return FS.read(path.join(info.typingsDir, ref)).then((content) => {
							 delete written[path.join(info.typingsDir, ref)];
							 });*/
						}));
					});
				});
			});
		});
	});
});
