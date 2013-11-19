///<reference path="../../../globals.ts" />
///<reference path="../../../helper.ts" />
///<reference path="../../../../src/xm/iterate.ts" />
///<reference path="../../../../src/xm/assertVar.ts" />
///<reference path="../../../../src/xm/encode.ts" />

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
		info.wwwHTTP = helper.getProjectDevURL() + '/test/modules/http/www/';
		info.wwwDir = path.resolve(helper.getDirNameTmp(), '..', 'www');
		return info;
	}
	//'http://localhost:' + port + '/tsd-origin/test/modules/http/www/';
	//'/test/modules/http/www/';

	var cache:xm.http.HTTPCache;
	var opts:xm.http.CacheOpts;
	var object:xm.http.CacheObject;
	var request:xm.http.Request;

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
			assert.isFunction(xm.http.CacheOpts, 'opts');
			assert.isFunction(xm.http.CacheObject, 'object');
			assert.isFunction(xm.http.Request, 'request');
		});
	});

	describe('CacheOpts', () => {
		it('should have default values', () => {
			var opts = new xm.http.CacheOpts();
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

			beforeEach(() => {
				var url = test.wwwHTTP;

				request = new xm.http.Request(url + 'lorem.txt', {});
				request.lock();
			});

			it.eventually('should get a file', () => {
				opts = new xm.http.CacheOpts();
				opts.cacheRead = false;
				opts.cacheWrite = true;

				cache = new xm.http.HTTPCache(test.storeTmpDir, opts);
				//cache.verbose = true;

				return cache.getObject(request).then((obj:xm.http.CacheObject) => {
					assert.instanceOf(obj, xm.http.CacheObject, 'obj');
					assert.ok(obj.info);

					assert.instanceOf(obj.body, Buffer, '');

					var expected = xm.FileUtil.readFileSync(path.join(test.wwwDir, 'lorem.txt'), 'utf8');
					assert.isString(expected, 'expected');

					assert.strictEqual(obj.body.toString('utf8'), expected, 'content');

				});
			});

			it.eventually('should get a file from cache', () => {
				opts = new xm.http.CacheOpts();
				opts.cacheRead = true;
				opts.cacheWrite = false;
				opts.remoteRead = false;

				cache = new xm.http.HTTPCache(test.storeTmpDir, opts);
				//cache.verbose = true;

				return cache.getObject(request).then((obj:xm.http.CacheObject) => {
					assert.instanceOf(obj, xm.http.CacheObject, 'obj');
					assert.ok(obj.info);

					assert.instanceOf(obj.body, Buffer, 'obj.body');

					var expected = xm.FileUtil.readFileSync(path.join(test.wwwDir, 'lorem.txt'), 'utf8');
					assert.isString(expected, 'expected');

					assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
				});
			});
		});
	});
});
