///<reference path="../../../globals.ts" />
///<reference path="../../../tsdHelper.ts" />
///<reference path="../../../../src/tsd/API.ts" />
///<reference path="../../../../src/tsd/select/Selector.ts" />
///<reference path="../../../../src/xm/io/hash.ts" />

describe('API', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var FS = require('q-io/fs');
	var assert:Chai.Assert = require('chai').assert;

	var api:tsd.API;
	var context:tsd.Context;

	before(() => {
	});
	after(() => {
	});
	beforeEach(() => {
		context = helper.getContext();
		context.config.log.enabled = false;
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

	function applyTestInfo(group:string, name:string, test:any, selector:tsd.Selector):helper.TestInfo {
		var tmp = helper.getTestInfo(group, name, test, true);

		api.context.paths.configFile = tmp.configFile;

		xm.FileUtil.writeJSONSync(tmp.testDump, test);
		xm.FileUtil.writeJSONSync(tmp.selectorDump, selector);

		api.debug = test.debug;

		return tmp;
	}

	function getSelector(test) {
		assert.property(test, 'selector');
		assert.property(test.selector, 'pattern');
		var selector = new tsd.Selector(test.selector.pattern);

		return selector;
	}

	describe('search', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'search'));

		xm.eachProp(data.tests, (test, name) => {
			if (test.skip) {
				return;
			}

			it.eventually('selector "' + name + '"', () => {
				api = getAPI(context);

				var selector = getSelector(test);
				var info = applyTestInfo('search', name, data, selector);

				return api.search(selector).then((result:tsd.APIResult) => {
					helper.assertUpdateStat(api.core.gitAPI.loader, 'api');
					assert.instanceOf(result, tsd.APIResult, 'result');

					xm.FileUtil.writeJSONSync(info.resultFile, helper.serialiseAPIResult(result));

					var resultExpect = xm.FileUtil.readJSONSync(info.resultExpect);
					helper.assertAPIResult(result, resultExpect, 'result');
				});
			});
		});
	});

	describe('install', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'install'));

		xm.eachProp(data.tests, (test, name) => {
			if (data.skip) {
				return;
			}

			it.eventually('test "' + name + '"', () => {
				api = getAPI(context);

				var selector = getSelector(test);
				var info = applyTestInfo('install', name, test, selector);

				return api.install(selector).then((result:tsd.APIResult) => {
					helper.assertUpdateStat(api.core.gitAPI.loader, 'api');
					helper.assertUpdateStat(api.core.gitRaw.loader, 'raw');
					assert.instanceOf(result, tsd.APIResult, 'result');

					xm.FileUtil.writeJSONSync(info.resultFile, helper.serialiseAPIResult(result));

					var resultExpect = xm.FileUtil.readJSONSync(info.resultExpect);
					helper.assertAPIResult(result, resultExpect, 'result');

					var configExpect = xm.FileUtil.readJSONSync(info.configExpect);
					var configActual = xm.FileUtil.readJSONSync(info.configFile);

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
