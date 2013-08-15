///<reference path="../../_ref.ts" />
///<reference path="../../../src/tsd/APICore.ts" />
///<reference path="../../../src/xm/io/mkdirCheck.ts" />

describe('APICore', function () {

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
		it('should return user data', (done) => {
			api.getIndex((err, index) => {
				assert.notOk(err, 'err');
				assert.ok(index, 'index,');

				api.context.log('api -> getIndex');
				xm.log.inspect(index);

				done();
			});
		});
	});
});
