/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
var assert = chai.assert;

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

describe('API', () => {

	it('should be defined', () => {
		assert.isFunction(API, 'constructor');
	});

	it('should throw on bad params', () => {
		assert.throws(() => {
			var api = new API(null);
		});
	});

	function getAPI(): API {
		var context = tsdHelper.getContext();
		var api = new API(context);
		tsdHelper.applyCoreUpdate(api.core);
		return api;
	}

	function applyTestInfo(group: string, name: string, test: any, api: API, query: Query, opt: Options): TestInfo {
		var tmp = new TestInfo(group, name, test, true);

		api.context.paths.configFile = tmp.configFile;

		fileIO.writeJSONSync(tmp.testDump, test);
		fileIO.writeJSONSync(tmp.queryDump, query);
		fileIO.writeJSONSync(tmp.optionsDump, opt);

		api.verbose = test.debug;
		return tmp;
	}

	function getQuery(test: any): Query {
		assert.property(test, 'query');

		var query = new Query(test.query.pattern);

		return query;
	}

	function getOptions(test: any): Options {
		var opts = new Options();
		opts.saveToConfig = !!test.save;
		opts.overwriteFiles = !!test.overwrite;
		opts.resolveDependencies = !!test.resolve;
		return opts;
	}

	function setupCase(api: API, name: string, test: any, info: TestInfo): Promise<any> {
		if (!test.modify) {
			return Promise.resolve();
		}
		var before = test.modify.before;

		return Promise.try(() => {
			if (before.query) {
				var query = getQuery(before);
				var opts = getOptions(before);
				if (test.debug) {
					console.log('skip modify query of ' + name);
				}
				return api.select(query, opts).then((selection: Selection) => {
					return api.install(selection, opts).then((result: InstallResult) => {

					});
				});
			}
			return Promise.resolve();
		}).then(() => {
			if (before.content) {
				Object.keys(before.content).forEach((dest: string) => {
					var value: string = before.content[dest];
					var destFull = path.join(info.typingsDir, dest);
					if (test.debug) {
						console.log('setting content of ' + name + ' in ' + destFull);
					}
					fileIO.writeFileSync(destFull, value);
				});
			}
		});
	}

	describe('search', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'search'));

		Object.keys(data.tests).forEach((name: string) => {
			var test = data.tests[name];
			if (test.skip) {
				return;
			}

			it('query "' + name + '"', () => {
				var api = getAPI();

				var query = getQuery(test);
				var opts = getOptions(test);
				var info = applyTestInfo('search', name, test, api, query, opts);

				return setupCase(api, test, name, info).then(() => {
					return api.select(query);
				}).then((selection: Selection) => {
					assert.instanceOf(selection, Selection, 'selection');

					fileIO.writeJSONSync(info.resultFile, testSelection.serialise(selection, 2));

					var resultExpect = fileIO.readJSONSync(info.resultExpect);
					testSelection.assertion(selection, resultExpect, 'result');
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
				var api = getAPI();

				var query = getQuery(test);
				var opts = getOptions(test);
				var info = applyTestInfo('install', name, test, api, query, opts);

				return setupCase(api, name, test, info).then(() => {
					return api.select(query, opts);
				}).then((selection: Selection) => {
					return api.install(selection, opts);
				}).then((result: InstallResult) => {
					assert.instanceOf(result, InstallResult, 'result');

					return Promise.all([
						fileIO.readJSON(info.resultExpect),
						fileIO.readJSON(info.configExpect),
						fileIO.read(info.bundleExpect, {encoding: 'utf8'}).catch(e => ''),

						fileIO.readJSON(info.configFile),
						fileIO.read(info.bundleFile, {encoding: 'utf8'}).catch(e => ''),

						fileIO.writeJSON(info.resultFile, testInstallResult.serialise(result, 2))

					]).spread((resultExpect, configExpect, bundleExpect, configActual, bundleActual) => {

						testInstallResult.assertion(result, resultExpect, 'result');
						assert.deepEqual(configActual, configExpect, 'configActual');
						testConfig.assertion(api.context.config, configExpect, 'api.context.config');
						helper.longAssert(bundleActual, bundleExpect, 'bundle');

						console.log('-> helper.assertDefPathsP should have assertContent enabled!');

						return tsdHelper.assertDefPathsP(info.typingsDir, info.typingsExpect, false, 'typing');
					}).then(() => {
						// extra check (partially covered by combinations of previous)
						return tsdHelper.listDefPaths(info.typingsDir).then((typings: string[]) => {
							assert.includeMembers(typings, api.context.config.getInstalledPaths(), 'saved installed file');
							if (test.modify && test.modify.written) {
								var writenPaths = defUtil.getPathsOf(result.written.values());
								assert.sameMembers(writenPaths.sort(), test.modify.written.sort(), 'written: files');
							}
						});
					});
				});
			});
		});
	});
});
