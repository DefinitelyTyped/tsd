///<reference path="../../_ref.ts" />
///<reference path="../../../src/tsd/logic/Core.ts" />
///<reference path="../../../src/tsd/select/Selector.ts" />

describe('Core', () => {

	var fs = require('fs');
	var path = require('path');

	var _:UnderscoreStatic = <UnderscoreStatic>require('underscore');

	var api:tsd.Core;
	var context:tsd.Context;
	before(() => {
		context = new tsd.Context();
		context.paths.setTmp('./tmp');
		context.paths.setCache('./cache');

		assert.isDirectory(context.paths.tmp, 'context.paths.tmp');
		assert.isDirectory(context.paths.cache, 'context.paths.cache');
	});

	it('should be defined', () => {
		assert.isFunction(tsd.Core, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			api = new tsd.Core(null);
		});
	});
	it('should be constructor', () => {
		api = new tsd.Core(context);
		assert.isObject(api, 'constructor');

		//api.gitAPI.debug = true;
	});
	describe('getIndex', () => {
		it('should return data', (done) => {
			api.getIndex().then(() => {

				//api.context.log('api -> getIndex');

				//xm.log.inspect(api.definitions.list);

				assert.operator(api.index.list.length, '>', 200, 'definitions.list');

				//xm.log(api.definitions.toDump());
				//xm.log(api.definitions.getPaths());
			}).fin(done).done();
		});
	});
	describe('search', () => {
		it('should return data', (done) => {
			var selector = new tsd.Selector('async/async');
			//selector.resolveReferences = true;

			api.select(selector).then((result:tsd.APIResult) => {
				assert.ok(result, 'result');

				//api.context.log('api -> search');

				//xm.log.inspect(result);

				assert.ok(result.nameMatches, 'result.nameMatch');
				assert.operator(result.nameMatches.length, '>=', 1, 'result.nameMatch');

			}).fin(done).done();
		});
	});
});
