///<reference path="../../_ref.ts" />
///<reference path="../../../src/tsd/APICore.ts" />
///<reference path="../../../src/tsd/data/Definition.ts" />
///<reference path="../../../src/tsd/data/Selector.ts" />

describe('APICore', () => {

	var fs = require('fs');
	var path = require('path');

	var _:UnderscoreStatic = <UnderscoreStatic>require('underscore');

	var api:tsd.APICore;
	var context:tsd.Context;
	before(() => {
		context = new tsd.Context();
		context.paths.setTmp('./tmp');
		context.paths.setCache('./cache/APICore');

		assert.isDirectory(context.paths.tmp, 'context.paths.tmp');
		assert.isDirectory(context.paths.cache, 'context.paths.cache');
	});

	it('should be defined', () => {
		assert.isFunction(tsd.APICore, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			api = new tsd.APICore(null);
		});
	});
	it('should be constructor', () => {
		api = new tsd.APICore(context);
		assert.isObject(api, 'constructor');

		api.gitAPI.debug = true;
	});
	describe('getIndex', () => {
		it('should return data', (done) => {
			api.getIndex((err) => {
				assert.notOk(err, 'err');

				api.context.log('api -> getIndex');

				//xm.log.inspect(api.definitions.list);

				assert.operator(api.definitions.list.length, '>', 200, 'definitions.list');

				//xm.log(api.definitions.toDump());
				//xm.log(api.definitions.getPaths());

				done();
			});
		});
	});
	describe('search', () => {
		it('should return data', (done) => {
			var selector = new tsd.Selector('async/async');
			selector.references = true;

			api.select(selector, null, (err, result:tsd.APIResult) => {
				assert.notOk(err, 'err');
				assert.ok(result, 'result,');

				api.context.log('api -> search');

				xm.log.inspect(result);

				assert.operator(result.patternMatch.length, '>=', 1, 'result.patternMatch');


				done();
			});
		});
	});
});
