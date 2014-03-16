/// <reference path="../../../_ref.d.ts" />

import fs = require('fs');
import path = require('path');

import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import fileIO = require('../../../../src/xm/file/fileIO');

import HTTPCache = require('../../../../src/xm/http/HTTPCache');
import CacheObject = require('../../../../src/xm/http/CacheObject');
import CacheInfo = require('../../../../src/xm/http/CacheInfo');
import CacheOpts = require('../../../../src/xm/http/CacheOpts');
import CacheRequest = require('../../../../src/xm/http/CacheRequest');
import CacheObject = require('../../../../src/xm/http/CacheObject');
import CacheObject = require('../../../../src/xm/http/CacheObject');

import helper = require('../../../src/helper');

class HttpTest {
	storeTmpDir: string;
	storeFixtureDir: string;
	wwwHTTP: string;
	wwwDir: string;
}

describe('xm.http', () => {

	var assert: Chai.Assert = require('chai').assert;
	var path = require('path');
	var fs = require('fs');

	function getInfo(name: string): HttpTest {
		assert.isString(name, 'name');
		var info = new HttpTest();
		info.storeTmpDir = path.join(helper.getDirNameTmp(), name);
		info.storeFixtureDir = path.join(helper.getDirNameFixtures(), name);
		info.wwwHTTP = 'http://127.0.0.1:9090/';
		info.wwwDir = path.resolve(helper.getDirNameTmp(), '..', 'www');
		return info;
	}

	var cache: HTTPCache;
	var opts: CacheOpts;
	var object: CacheObject;
	var request: CacheRequest;

	before(() => {

	});
	after(() => {

	});

	afterEach(() => {
		cache = null;
		opts = null;
		object = null;
		request = null;
	});

	describe('HTTPCache core', () => {
		// TODO add more existence tests
		it('should exist', () => {
			assert.isFunction(HTTPCache, 'cache');
			assert.isFunction(CacheOpts, 'opts');
			assert.isFunction(CacheObject, 'object');
			assert.isFunction(CacheRequest, 'request');
		});
	});

	describe('CacheOpts', () => {
		it('should have default values', () => {
			var opts = new CacheOpts();
			assert.isTrue(opts.remoteRead, 'remoteRead');

			assert.isTrue(opts.cacheRead, 'cacheRead');
			assert.isTrue(opts.cacheWrite, 'cacheWrite');

			assert.isFalse(opts.compressStore, 'compressStore');
			assert.strictEqual(opts.splitDirLevel, 0, 'splitDirLevel');
			assert.strictEqual(opts.splitDirChunk, 1, 'splitDirChunk');
		});
	});
	describe('cache simple http get', () => {
		var test: HttpTest = getInfo('simple');
		var url = test.wwwHTTP + 'lorem.txt';
		var src = path.join(test.wwwDir, 'lorem.txt');
		var date = new Date();
		var expected;
		before(() => {
			fs.utimesSync(src, date, date);

			expected = fileIO.readFileSync(path.join(test.wwwDir, 'lorem.txt'), 'utf8');
		});
		beforeEach(() => {
		});

		it('should get a file', () => {
			opts = new CacheOpts();
			opts.cacheRead = false;
			opts.cacheWrite = true;

			cache = new HTTPCache(test.storeTmpDir, opts);
			// cache.verbose = true;

			request = new CacheRequest(url, {});
			request.lock();

			return cache.getObject(request).then((obj: CacheObject) => {
				assert.instanceOf(obj, CacheObject, 'obj');
				assert.ok(obj.info);

				assert.ok(obj.response, 'obj.response');
				assert.strictEqual(obj.response.status, 200, 'obj.response.status');

				assert.instanceOf(obj.body, Buffer, '');
				assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
			});
		});

		it('should get a file from cache', () => {
			opts = new CacheOpts();
			opts.cacheRead = true;
			opts.cacheWrite = false;
			opts.remoteRead = false;

			cache = new HTTPCache(test.storeTmpDir, opts);
			// cache.verbose = true;

			request = new CacheRequest(url, {});
			request.lock();

			return cache.getObject(request).then((obj: CacheObject) => {
				assert.instanceOf(obj, CacheObject, 'obj');
				assert.ok(obj.info);

				assert.instanceOf(obj.body, Buffer, 'obj.body');
				assert.notOk(obj.response, 'obj.response');

				assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
			});
		});

		it('should get a file from http if forced', () => {
			opts = new CacheOpts();
			opts.cacheRead = true;
			opts.cacheWrite = false;
			opts.remoteRead = true;

			cache = new HTTPCache(test.storeTmpDir, opts);
			// cache.verbose = true;

			request = new CacheRequest(url, {});
			request.forceRefresh = true;
			request.lock();

			return cache.getObject(request).then((obj: CacheObject) => {
				assert.instanceOf(obj, CacheObject, 'obj');
				assert.ok(obj.info);

				assert.ok(obj.response, 'obj.response');
				assert.strictEqual(obj.response.status, 200, 'obj.response.status');

				assert.instanceOf(obj.body, Buffer, 'obj.body');
				assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
			});
		});

		it('should get a file from http if stale', () => {
			opts = new CacheOpts();
			opts.cacheRead = true;
			opts.cacheWrite = false;
			opts.remoteRead = true;

			cache = new HTTPCache(test.storeTmpDir, opts);
			// cache.verbose = true;

			request = new CacheRequest(url, {});
			request.localMaxAge = -24 * 3600 * 1000;
			request.lock();

			return cache.getObject(request).then((obj: CacheObject) => {
				assert.instanceOf(obj, CacheObject, 'obj');
				assert.ok(obj.info);

				assert.ok(obj.response, 'obj.response');
				assert.strictEqual(obj.response.status, 200, 'obj.response.status');

				assert.instanceOf(obj.body, Buffer, 'obj.body');
				assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
			});
		});

		it('should get a file from cache if within age', () => {
			opts = new CacheOpts();
			opts.cacheRead = true;
			opts.cacheWrite = false;
			opts.remoteRead = true;

			cache = new HTTPCache(test.storeTmpDir, opts);
			// cache.verbose = true;

			request = new CacheRequest(url, {});
			request.localMaxAge = 24 * 3600 * 1000;
			request.lock();

			return cache.getObject(request).then((obj: CacheObject) => {
				assert.instanceOf(obj, CacheObject, 'obj');
				assert.ok(obj.info);

				assert.notOk(obj.response, 'obj.response');

				assert.instanceOf(obj.body, Buffer, 'obj.body');
				assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
			});
		});

		it('should get a file from cache if interval high', () => {
			opts = new CacheOpts();
			opts.cacheRead = true;
			opts.cacheWrite = true;
			opts.remoteRead = true;

			cache = new HTTPCache(test.storeTmpDir, opts);
			// cache.verbose = true;

			request = new CacheRequest(url, {});
			request.httpInterval = 24 * 3600 * 1000;
			request.lock();

			return cache.getObject(request).then((obj: CacheObject) => {
				assert.instanceOf(obj, CacheObject, 'obj');
				assert.ok(obj.info);

				assert.notOk(obj.response, 'obj.response');

				assert.instanceOf(obj.body, Buffer, 'obj.body');
				assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
			});
		});

		it('should get a file from http if interval low', () => {
			opts = new CacheOpts();
			opts.cacheRead = true;
			opts.cacheWrite = true;
			opts.remoteRead = true;

			cache = new HTTPCache(test.storeTmpDir, opts);
			// cache.verbose = true;

			request = new CacheRequest(url, {});
			request.httpInterval = -24 * 3600 * 1000;
			request.lock();

			return cache.getObject(request).then((obj: CacheObject) => {
				assert.instanceOf(obj, CacheObject, 'obj');
				assert.ok(obj.info);

				assert.ok(obj.response, 'obj.response');
				assert.strictEqual(obj.response.status, 304, 'obj.response.status');

				assert.instanceOf(obj.body, Buffer, 'obj.body');
				assert.strictEqual(obj.body.toString('utf8'), expected, 'content');
			});
		});
	});
});
