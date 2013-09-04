///<reference path="../../_ref.ts" />
///<reference path="../../../src/tsd/logic/Core.ts" />
///<reference path="../../../src/tsd/select/Selector.ts" />

describe('Core', () => {

	var fs = require('fs');
	var path = require('path');

	var _:UnderscoreStatic = <UnderscoreStatic>require('underscore');

	var core:tsd.Core;
	var context:tsd.Context;
	before(() => {
		context = new tsd.Context();
		context.paths.cacheDir = path.resolve(__dirname, tsd.Const.cacheDir);
		context.verbose = true;
	});

	it('should be defined', () => {
		assert.isFunction(tsd.Core, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			core = new tsd.Core(null);
		});
	});
	it('should be constructor', () => {
		core = new tsd.Core(context);
		assert.isObject(core, 'constructor');

		//api.gitAPI.debug = true;
	});
	describe('getIndex', () => {
		it('should return data', (done) => {
			core = new tsd.Core(context);
			core.getIndex().then(() => {
				xm.log('api -> getIndex');
				//xm.log.inspect(api.definitions.list);

				assert.operator(core.index.list.length, '>', 200, 'definitions.list');

				//xm.log(api.definitions.toDump());
				//xm.log(api.definitions.getPaths());
			},(err) => {
				xm.log.error(err);
				assert(false, 'error: ' + err);
			}).fin(() => {
				done();
			}).done();
		});
	});
	describe('search', () => {
		it('should return data', (done) => {
			var selector = new tsd.Selector('async/async');

			core = new tsd.Core(context);
			core.select(selector).then((result:tsd.APIResult) => {
				assert.ok(result, 'result');

				xm.log('api -> search');

				//xm.log.inspect(result);

				assert.ok(result.nameMatches, 'result.nameMatch');
				assert.operator(result.nameMatches.length, '>=', 1, 'result.nameMatch');

			},(err) => {
				xm.log.error(err);
				assert(false, 'error: ' + err);
			}).fin(() => {
				done();
			}).done();
		});
	});
});
