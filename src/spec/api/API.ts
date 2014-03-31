/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import fileIO = require('../../xm/file/fileIO');
import collection = require('../../xm/collection');
import helper = require('../../test/helper');
import TestInfo = require('../../test/TestInfo');
import testInstallResult = require('../../test/tsd/InstallResult');
import testSelection = require('../../test/tsd/Selection');
import testConfig = require('../../test/tsd/Config');

import tsdHelper = require('../../test/tsdHelper');

import Context = require('../../tsd/context/Context');
import Core = require('../../tsd/logic/Core');
import Query = require('../../tsd/select/Query');
import InstallResult = require('../../tsd/logic/InstallResult');
import Selection = require('../../tsd/select/Selection');
import API = require('../../tsd/API');
import Options = require('../../tsd/Options');
import defUtil = require('../../tsd/util/defUtil');

import log = require('../../xm/log');

describe('API', () => {
	'use strict';

	var api: API;
	var context: Context;

	before(() => {
	});

	after(() => {
	});

	beforeEach(() => {
		context = tsdHelper.getContext();
		context.config.log.enabled = false;
	});

	afterEach(() => {
		context = null;
		api = null;
	});

	it('should be defined', () => {
		assert.isFunction(API, 'constructor');
	});

	it('should throw on bad params', () => {
		assert.throws(() => {
			api = new API(null);
		});
	});

	function getAPI(context: Context): API {
		var api = new API(context);
		tsdHelper.applyCoreUpdate(api.core);
		return api;
	}

	function applyTestInfo(group: string, name: string, test: any, query: Query, opt: Options): TestInfo {
		var tmp = new TestInfo(group, name, test, true);

		api.context.paths.configFile = tmp.configFile;

		fileIO.writeJSONSync(tmp.testDump, test);
		fileIO.writeJSONSync(tmp.queryDump, query);
		fileIO.writeJSONSync(tmp.optionsDump, opt);

		api.verbose = test.debug;
		console.log(tmp);
		return tmp;
	}

	function getQuery(test: any): Query {
		assert.property(test, 'query');

		var query = new Query(test.query.pattern);

		return query;
	}

	function getOptions(test: any): Options {
		var opts = new Options();
		opts.saveToConfig = test.save;
		opts.overwriteFiles = test.overwrite;
		opts.resolveDependencies = test.resolve;
		return opts;
	}

	function setupCase(api: API, name: string, test: any, info: TestInfo): Promise<any> {
		if (test.modify) {
			var before = test.modify.before;

			var runModifyQuery = function (): Promise<any> {
				if (before.query) {
					var query = getQuery(before);
					var opts = getOptions(before);
					if (test.debug) {
						log.debug('skip modify query of ' + name);
					}
					return api.select(query, opts).then((selection: Selection) => {
						return api.install(selection, opts).then((result: InstallResult) => {

						});
					});
				}
				else {
					return Promise.resolve();
				}
			};
			var runModifyContent = function (): Promise<any> {
				if (before.content) {
					Object.keys(before.content).forEach((dest: string) => {
						var value: string = before.content[dest];
						var destFull = path.join(info.typingsDir, dest);
						if (test.debug) {
							log.debug('setting content of ' + name + ' in ' + dest);
						}
						fileIO.writeFileSync(destFull, value);
					});
				}
				return Promise.resolve();
			};

			return runModifyQuery().then(runModifyContent);
		}
		return Promise.resolve();
	}

	describe('search', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'search'));

		Object.keys(data.tests).forEach((name: string) => {
			var test = data.tests[name];
			if (test.skip) {
				return;
			}

			it('query "' + name + '"', () => {
				api = getAPI(context);

				var query = getQuery(test);
				var opts = getOptions(test);
				var info = applyTestInfo('search', name, test, query, opts);

				return setupCase(api, test, name, info).then(() => {
					return api.select(query).then((selection: Selection) => {
						assert.instanceOf(selection, Selection, 'selection');

						fileIO.writeJSONSync(info.resultFile, testSelection.serialise(selection, 2));

						var resultExpect = fileIO.readJSONSync(info.resultExpect);
						testSelection.assertion(selection, resultExpect, 'result');
					});
				});
			});
		});
	});

	describe('install', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'install'));

		Object.keys(data.tests).forEach((name: string) => {
			var test = data.tests[name];
			if (test.skip) {
				return;
			}

			it('test "' + name + '"', () => {
				api = getAPI(context);

				var query = getQuery(test);
				var opts = getOptions(test);
				var info = applyTestInfo('install', name, test, query, opts);

				return setupCase(api, name, test, info).then(() => {
					return api.select(query, opts).then((selection: Selection) => {
						return api.install(selection, opts).then((result: InstallResult) => {
							assert.instanceOf(result, InstallResult, 'result');

							fileIO.writeJSONSync(info.resultFile, testInstallResult.serialise(result, 2));

							var resultExpect = fileIO.readJSONSync(info.resultExpect);
							testInstallResult.assertion(result, resultExpect, 'result');

							var configExpect = fileIO.readJSONSync(info.configExpect);
							var configActual = fileIO.readJSONSync(info.configFile);

							assert.deepEqual(configActual, configExpect, 'configActual');
							testConfig.assertion(api.context.config, configExpect, 'api.context.config');

							log.out.line().warning('-> ').span('helper.assertDefPathsP').space().warning('should have assertContent enabled!').line();

							return tsdHelper.assertDefPathsP(info.typingsDir, info.typingsExpect, false, 'typing').then(() => {

								// extra check (partially covered by combinations of previous)

								return tsdHelper.listDefPaths(info.typingsDir).then((typings: string[]) => {
									assert.includeMembers(typings, context.config.getInstalledPaths(), 'saved installed file');
									if (test.modify && test.modify.written) {
										var writenPaths = defUtil.getPathsOf(collection.valuesOf(result.written));
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
});
