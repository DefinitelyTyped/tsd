///<reference path="../../../globals.ts" />
///<reference path="../../../helper.ts" />

module helper {

	export class HttpTest {
		storeTmpDir:string;
		storeFixtureDir:string;
		wwwHTTP:string;
		wwwDir:string;
	}
}

describe('xm.http', () => {
	var track:xm.EventLog;
	before(() => {
		track = new xm.EventLog('xm.http');
	});
	after(() => {
		track = null;
	});

	var assert:Chai.Assert = require('chai').assert;
	var path = require('path');

	function getInfo(name:string):helper.HttpTest {
		assert.isString(name, 'name');
		var info = new helper.HttpTest();
		info.storeTmpDir = path.join(helper.getDirNameTmp(), name);
		info.storeFixtureDir = path.join(helper.getDirNameFixtures(), name);
		info.wwwHTTP = 'http://localhost:9797/';
		info.wwwDir = path.resolve(helper.getDirNameTmp(), '..',  'www');
		return null;
	}

	var cache:xm.http.HTTPCache;
	var opts:xm.http.HTTPCacheOpts;
	var object:xm.http.HTTPCacheObject;
	var request:xm.http.HTTPRequest;

	afterEach(() => {
		cache = null;
		opts = null;
		object = null;
		request = null;
	});

	describe('HTTPCache core', () => {
		//TODO add more
		it('should exist', () => {
			assert.isFunction(xm.http.HTTPCache, 'cache');
			assert.isFunction(xm.http.HTTPCacheOpts, 'opts');
			assert.isFunction(xm.http.HTTPCacheObject, 'object');
			assert.isFunction(xm.http.HTTPRequest, 'request');
		});
	});

	describe('HTTPCacheOpts', () => {
		it('should have default values', () => {
			var opts = new xm.http.HTTPCacheOpts();
			assert.isTrue(opts.remoteRead, 'remoteRead');

			assert.isTrue(opts.cacheRead, 'cacheRead');
			assert.isTrue(opts.cacheWrite, 'cacheWrite');

			assert.isFalse(opts.compressStore, 'compressStore');
			assert.strictEqual(opts.splitKeyDir, 0, 'splitKeyDir');
		});
	});

	describe('cache', () => {
		describe('simple http get', () => {
			var test:helper.HttpTest = getInfo('simple');

			it.eventually('should get a file', () => {
				opts = new xm.http.HTTPCacheOpts();
				opts.cacheRead = false;
				opts.cacheWrite = false;
				cache = new xm.http.HTTPCache(test.storeTmpDir, opts);

				request = new xm.http.HTTPRequest(test.wwwHTTP + 'lorem.txt', {}, 'txt');
				request.lock();

				return cache.getObject(request).then((obj:xm.http.HTTPCacheObject) => {
					assert.instanceOf(obj, xm.http.HTTPCacheObject, 'obj');
					assert.ok(obj.info);

					var content = xm.FileUtil.readFileSync(path.join(test.wwwDir, 'lorem.txt'));
				});
			});
		});
	});
});
