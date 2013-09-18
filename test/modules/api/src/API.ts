///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/tsd/API.ts" />
///<reference path="../../../../src/tsd/select/Selector.ts" />
///<reference path="../../../../src/xm/io/hash.ts" />

describe('API', () => {

	var fs = require('fs');
	var path = require('path');
	var FS:Qfs = require('q-io/fs');

	var api:tsd.API;
	var context:tsd.Context;

	before(() => {
		//copy temp for saving
	});
	beforeEach(() => {
		context = helper.getContext();
		context.log.mute = true;
		context.config.log.mute = true;
	});

	it('should be defined', () => {
		assert.isFunction(tsd.API, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			api = new tsd.API(null);
		});
	});
	it('should be constructor', () => {
		api = new tsd.API(context);
		assert.isObject(api, 'constructor');

		//api.gitAPI.debug = true;
	});

	describe('search', () => {
		var select = require(path.resolve(__dirname, '../fixtures/select'));
		var i = 0;
		select.forEach((data) => {
			var selector = new tsd.Selector(data.selector.pattern);

			it('selector "' + String(selector) + '"', () => {
				context.log.mute = !data.debug;
				context.config.log.mute = !data.debug;

				var tmp = helper.getTempInfo('search', (i++), true);
				context.paths.configFile = tmp.configFile;

				xm.FileUtil.writeJSONSync(tmp.selectorDumpFile, selector);
				xm.FileUtil.writeJSONSync(tmp.dataCopyFile, data);

				api = new tsd.API(context);
				api.core.log.mute = !data.debug;
				api.context.config.typingsPath = tmp.typingsDir;

				return api.search(selector).then((result:tsd.APIResult) => {
					helper.assertAPIResult(result, data.result, 'result');
				});
			});
		});
	});

	describe('install', () => {
		var select =  require(path.resolve(__dirname, '../fixtures/install'));
		var i = 0;
		select.forEach((data) => {
			var selector = new tsd.Selector(data.selector.pattern);

			it('selector "' + String(selector) + '"', () => {
				context.log.mute = !data.debug;
				context.config.log.mute = !data.debug;

				var tmp = helper.getTempInfo('install', (i++), true);
				context.paths.configFile = tmp.configFile;

				xm.FileUtil.writeJSONSync(tmp.selectorDumpFile, selector);
				xm.FileUtil.writeJSONSync(tmp.dataCopyFile, data);

				api = new tsd.API(context);
				api.core.log.mute = !data.debug;
				api.context.config.typingsPath = tmp.typingsDir;

				return api.install(selector).then((result:tsd.APIResult) => {
					helper.assertAPIResult(result, data.result, 'result');
					assert.isFile(api.context.paths.configFile);

					//return FS.listDirectoryTree(typings)

					if (!data.config) {
						return null;
					}
					data.config.typingsPath = tmp.typingsDir;

					return xm.FileUtil.readJSONPromise(api.context.paths.configFile).then((json) => {
						assert.jsonOf(json, data.config, 'config');
					});
				});
			});
		});
	});
});
