/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');

import HTTPCache = require('../../http/HTTPCache');
import HTTPOpts = require('../../http/HTTPOpts');
import CacheInfo = require('../../http/CacheInfo');
import CacheOpts = require('../../http/CacheOpts');
import CacheObject = require('../../http/CacheObject');
import CacheRequest = require('../../http/CacheRequest');

class HttpTest {
	storeTmpDir: string;
	storeFixtureDir: string;
	wwwHTTP: string;
	wwwDir: string;
}

describe('HTTPCache', () => {

	function getInfo(name: string): HttpTest {
		assert.isString(name, 'name');
		var info = new HttpTest();
		info.storeTmpDir = path.join(helper.getDirNameTmp(), name);
		info.storeFixtureDir = path.join(helper.getDirNameFixtures(), name);
		info.wwwHTTP = 'http://127.0.0.1:9090/';
		info.wwwDir = path.resolve(helper.getDirNameTmp(), '..', 'www');
		return info;
	}

	function getOpts(test: HttpTest): HTTPOpts {
		var cacheOpts = new CacheOpts();
		cacheOpts.storeDir = test.storeTmpDir;

		// TODO set proxy
		return {
			cache: cacheOpts
		};
	}

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
			expected = fileIO.readFileSync(src, 'utf8');
			fs.utimesSync(src, date, date);
		});

		it('should get a file', () => {
			var opts = getOpts(test);
			opts.cache.cacheRead = false;
			opts.cache.cacheWrite = true;

			var cache = new HTTPCache(opts);
			// cache.verbose = true;

			var request = new CacheRequest(url, {});
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
			var opts = getOpts(test);
			opts.cache.cacheRead = true;
			opts.cache.cacheWrite = false;
			opts.cache.remoteRead = false;

			var cache = new HTTPCache(opts);
			// cache.verbose = true;

			var request = new CacheRequest(url, {});
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
			var opts = getOpts(test);
			opts.cache.cacheWrite = false;

			var cache = new HTTPCache(opts);
			// cache.verbose = true;

			var request = new CacheRequest(url, {});
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
			var opts = getOpts(test);
			opts.cache.cacheWrite = false;

			var cache = new HTTPCache(opts);
			// cache.verbose = true;

			var request = new CacheRequest(url, {});
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
			var opts = getOpts(test);
			opts.cache.cacheWrite = false;

			var cache = new HTTPCache(opts);
			// cache.verbose = true;

			var request = new CacheRequest(url, {});
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
			var opts = getOpts(test);

			var cache = new HTTPCache(opts);
			// cache.verbose = true;

			var request = new CacheRequest(url, {});
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
			var opts = getOpts(test);

			var cache = new HTTPCache(opts);
			// cache.verbose = true;

			var request = new CacheRequest(url, {});
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
