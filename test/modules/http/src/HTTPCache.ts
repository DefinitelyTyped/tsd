/// <reference path="../../../globals.ts" />
/// <reference path="../../../helper.ts" />
/// <reference path="../../../../src/xm/iterate.ts" />
/// <reference path="../../../../src/xm/assertVar.ts" />
/// <reference path="../../../../src/xm/encode.ts" />

module helper {
	'use strict';

	export class HttpTest {
		storeTmpDir:string;
		storeFixtureDir:string;
		wwwHTTP:string;
		wwwDir:string;
	}
}

describe('xm.http', () => {
	'use strict';

	var track:xm.EventLog;
	before(() => {
		track = new xm.EventLog('xm.http');
	});
	after(() => {
		track = null;
	});

	var assert:Chai.Assert = require('chai').assert;
	var path = require('path');
	var fs = require('fs');

	function getInfo(name:string):helper.HttpTest {
		assert.isString(name, 'name');
		var info = new helper.HttpTest();
		info.storeTmpDir = path.join(helper.getDirNameTmp(), name);
		info.storeFixtureDir = path.join(helper.getDirNameFixtures(), name);
		info.wwwHTTP = 'http://localhost:9090/';
		info.wwwDir = path.resolve(helper.getDirNameTmp(), '..', 'www');
		return info;
	}

	var cache:xm.http.HTTPCache;
	var opts:xm.http.CacheOpts;
	var object:xm.http.CacheObject;
	var request:xm.http.CacheRequest;

	afterEach(() => {
		cache = null;
		opts = null;
		object = null;
		request = null;
	});

	describe('HTTPCache core', () => {
		// TODO add more existence tests
		it('should exist', () => {
			assert.isFunction(xm.http.HTTPCache, 'cache');
			assert.isFunction(xm.http.CacheOpts, 'opts');
			assert.isFunction(xm.http.CacheObject, 'object');
			assert.isFunction(xm.http.CacheRequest, 'request');
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
			var url = test.wwwHTTP + 'lorem.txt';
			var src = path.join(test.wwwDir, 'lorem.txt');
			var date = new Date();
			var expected;
			before(() => {
				fs.utimesSync(src, date, date);

				expected = xm.file.readFileSync(path.join(test.wwwDir, 'lorem.txt'), 'utf8');
			});
			beforeEach(() => {
			});

			it.eventually('should get a file', () => {
				opts = new xm.http.CacheOpts();
				opts.cacheRead = false;
				opts.cacheWrite = true;

				cache = new xm.http.HTTPCache(test.storeTmpDir, opts);
				// cache.verbose = true;

				request = new xm.http.CacheRequest(url, {});
				request.lock();

				return cache.getObject(request).then((obj:xm.http.CacheObject) => {
					assert.instanceOf(obj, xm.http.CacheObject, 'obj');
					assert.ok(obj.info);

					assert.ok(obj.response, 'obj.response');
					assert.strictEqual(obj.response.status, 200, 'obj.response.status');

					assert.instanceOf(obj.body, Buffer, '');
					assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
				});
			});

			it.eventually('should get a file from cache', () => {
				opts = new xm.http.CacheOpts();
				opts.cacheRead = true;
				opts.cacheWrite = false;
				opts.remoteRead = false;

				cache = new xm.http.HTTPCache(test.storeTmpDir, opts);
				// cache.verbose = true;

				request = new xm.http.CacheRequest(url, {});
				request.lock();

				return cache.getObject(request).then((obj:xm.http.CacheObject) => {
					assert.instanceOf(obj, xm.http.CacheObject, 'obj');
					assert.ok(obj.info);

					assert.instanceOf(obj.body, Buffer, 'obj.body');
					assert.notOk(obj.response, 'obj.response');

					assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
				});
			});

			it.eventually('should get a file from http if forced', () => {
				opts = new xm.http.CacheOpts();
				opts.cacheRead = true;
				opts.cacheWrite = false;
				opts.remoteRead = true;

				cache = new xm.http.HTTPCache(test.storeTmpDir, opts);
				// cache.verbose = true;

				request = new xm.http.CacheRequest(url, {});
				request.forceRefresh = true;
				request.lock();

				return cache.getObject(request).then((obj:xm.http.CacheObject) => {
					assert.instanceOf(obj, xm.http.CacheObject, 'obj');
					assert.ok(obj.info);

					assert.ok(obj.response, 'obj.response');
					assert.strictEqual(obj.response.status, 200, 'obj.response.status');

					assert.instanceOf(obj.body, Buffer, 'obj.body');
					assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
				});
			});

			it.eventually('should get a file from http if stale', () => {
				opts = new xm.http.CacheOpts();
				opts.cacheRead = true;
				opts.cacheWrite = false;
				opts.remoteRead = true;

				cache = new xm.http.HTTPCache(test.storeTmpDir, opts);
				// cache.verbose = true;

				request = new xm.http.CacheRequest(url, {});
				request.localMaxAge = -24 * 3600 * 1000;
				request.lock();

				return cache.getObject(request).then((obj:xm.http.CacheObject) => {
					assert.instanceOf(obj, xm.http.CacheObject, 'obj');
					assert.ok(obj.info);

					assert.ok(obj.response, 'obj.response');
					assert.strictEqual(obj.response.status, 200, 'obj.response.status');

					assert.instanceOf(obj.body, Buffer, 'obj.body');
					assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
				});
			});

			it.eventually('should get a file from cache if within age', () => {
				opts = new xm.http.CacheOpts();
				opts.cacheRead = true;
				opts.cacheWrite = false;
				opts.remoteRead = true;

				cache = new xm.http.HTTPCache(test.storeTmpDir, opts);
				// cache.verbose = true;

				request = new xm.http.CacheRequest(url, {});
				request.localMaxAge = 24 * 3600 * 1000;
				request.lock();

				return cache.getObject(request).then((obj:xm.http.CacheObject) => {
					assert.instanceOf(obj, xm.http.CacheObject, 'obj');
					assert.ok(obj.info);

					assert.notOk(obj.response, 'obj.response');

					assert.instanceOf(obj.body, Buffer, 'obj.body');
					assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
				});
			});

			it.eventually('should get a file from cache if interval high', () => {
				opts = new xm.http.CacheOpts();
				opts.cacheRead = true;
				opts.cacheWrite = true;
				opts.remoteRead = true;

				cache = new xm.http.HTTPCache(test.storeTmpDir, opts);
				// cache.verbose = true;

				request = new xm.http.CacheRequest(url, {});
				request.httpInterval = 24 * 3600 * 1000;
				request.lock();

				return cache.getObject(request).then((obj:xm.http.CacheObject) => {
					assert.instanceOf(obj, xm.http.CacheObject, 'obj');
					assert.ok(obj.info);

					assert.notOk(obj.response, 'obj.response');

					assert.instanceOf(obj.body, Buffer, 'obj.body');
					assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
				});
			});

			it.eventually('should get a file from http if interval low', () => {
				opts = new xm.http.CacheOpts();
				opts.cacheRead = true;
				opts.cacheWrite = true;
				opts.remoteRead = true;

				cache = new xm.http.HTTPCache(test.storeTmpDir, opts);
				// cache.verbose = true;

				request = new xm.http.CacheRequest(url, {});
				request.httpInterval = -24 * 3600 * 1000;
				request.lock();

				return cache.getObject(request).then((obj:xm.http.CacheObject) => {
					assert.instanceOf(obj, xm.http.CacheObject, 'obj');
					assert.ok(obj.info);

					assert.ok(obj.response, 'obj.response');
					assert.strictEqual(obj.response.status, 304, 'obj.response.status');

					assert.instanceOf(obj.body, Buffer, 'obj.body');
					assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
				});
			});
		});
	});
});
