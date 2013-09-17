///<reference path="../../_ref.ts" />
///<reference path="../../../src/tsd/API.ts" />
///<reference path="../../../src/tsd/select/Selector.ts" />

describe('API', () => {

	var fs = require('fs');
	var path = require('path');

	var api:tsd.API;
	var context:tsd.Context;
	var badContext:tsd.Context;
	before(() => {
		context = helper.getContext();
		badContext = helper.getContext();
		badContext.paths.configFile = './non-existing/tsd-config.json';
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
	describe('readConfig', () => {
		it('should pass on missing optional data', () => {
			api = new tsd.API(badContext);
			return assert.isFulfilled(api.readConfig(true), 'promise');
		});
		it('should fail on missing data optional data', () => {
			api = new tsd.API(badContext);
			return assert.isRejected(api.readConfig(false), 'promise');
		});
	});
});
