///<reference path="../../_ref.ts" />
///<reference path="../../../src/tsd/logic/Core.ts" />
///<reference path="../../../src/tsd/select/Selector.ts" />

describe('Core', () => {

	var fs = require('fs');
	var path = require('path');

	var _:UnderscoreStatic = <UnderscoreStatic>require('underscore');

	var core:tsd.Core;
	var context:tsd.Context;
	var badContext:tsd.Context;
	before(() => {
		context = helper.getContext();
		badContext = helper.getContext();
		badContext.paths.configFile = './non-existing/tsd-config.json';
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
	describe('readConfig', () => {
		it('should pass on missing optional data', () => {
			core = new tsd.Core(badContext);
			return assert.isFulfilled(core.readConfig(true), 'promise');
		});
		it('should fail on missing data optional data', () => {
			core = new tsd.Core(badContext);
			return assert.isRejected(core.readConfig(false), 'promise');
		});
	});
	describe('getIndex', () => {
		it('should return data', () => {
			core = new tsd.Core(context);
			return assert.isFulfilled(core.getIndex().then(() => {
				//xm.log.inspect(api.definitions.list);

				assert.operator(core.index.list.length, '>', 200, 'definitions.list');

				xm.log(core.index.toDump());
				//xm.log(core.index.getPaths());
				return null;
			}));
		});
	});
	describe('select', () => {
		it('should return data', () => {
			var selector = new tsd.Selector('async/asy*');

			core = new tsd.Core(context);
			return assert.isFulfilled(core.select(selector).then((result:tsd.APIResult) => {
				assert.ok(result, 'result');
				//xm.log.inspect(result);

				assert.ok(result.nameMatches, 'result.nameMatch');
				assert.operator(result.nameMatches.length, '>=', 1, 'result.nameMatch');
				return result;
			}));
		});
	});
});
