///<reference path="../../../globals.ts" />
///<reference path="../../../tsdHelper.ts" />
///<reference path="../../../../src/tsd/API.ts" />
///<reference path="../../../../src/tsd/select/Selector.ts" />
///<reference path="../../../../src/xm/io/hash.ts" />
///<reference path="../../../../src/git/GitUtil.ts" />

describe('API', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var FS = require('q-io/fs');
	var Q = require('q');
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

	function getSelector(test:any) {
		assert.property(test, 'selector');
		assert.property(test.selector, 'pattern');

		var selector = new tsd.Selector(test.selector.pattern);
		selector.saveToConfig = test.save;
		selector.overwriteFiles = test.overwrite;
		selector.resolveDependencies = test.resolve;

		return selector;
	}

	function setupCase(api:tsd.API, name:string, test:any, info:helper.TestInfo):Q.Promise<any> {
		if (test.modify) {
			var before = test.modify.before;

			var runModifySelector = function ():Q.Promise<any> {
				if (before.selector) {
					var selector = getSelector(before);
					if (test.debug) {
						xm.log.debug('skip modify selector of ' + name);
					}
					return api.install(selector).then((result:tsd.APIResult) => {

					});
				}
				else {
					return Q.resolve();
				}
			};
			var runModifyContent = function ():Q.Promise<any> {
				if (before.content) {
					xm.eachProp(before.content, (value:string, dest:string) => {
						var destFull = path.join(info.typingsDir, dest);
						if (test.debug) {
							xm.log.debug('setting content of ' + name + ' in ' + dest);
						}
						xm.FileUtil.writeFileSync(destFull, value);
					});
				}
				return Q.resolve();
			};

			return runModifySelector().then(runModifyContent);
		}
		return Q.resolve();
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
				var info = applyTestInfo('search', name, test, selector);

				return setupCase(api, test, name, info).then(() => {
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

				return setupCase(api, name, test, info).then(() => {
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

						xm.log.out.line().warning('-> ').span('helper.assertDefPathsP').space().warning('should have assertContent enabled!').line();

						return helper.assertDefPathsP(info.typingsDir, info.typingsExpect, false, 'typing').then(() => {

							//extra check (partially covered by combinations of previous)

							return helper.listDefPaths(info.typingsDir).then((typings:string[]) => {
								assert.includeMembers(typings, context.config.getInstalledPaths(), 'saved installed file');
								if (test.modify && test.modify.written) {
									var writenPaths = tsd.DefUtil.getPathsOf(result.written.values());
									assert.sameMembers(writenPaths.sort(), test.modify.written.sort(), 'written: files');
								}
							});
						});
					});
				});
			});
		});
	});
});
