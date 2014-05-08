/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import Joi = require('joi');
import joiAssert = require('joi-assert');

import log = require('../../xm/log');
import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');
import gitHelper = require('../../test/git/gitHelper');

import GitUtil = require('../../git/gitUtil');
import GithubRepo = require('../../git/GithubRepo');
import GithubAPI = require('../../git/loader/GithubAPI');

describe('GithubAPI', () => {

	var repo: GithubRepo;
	var cacheDir: string;
	var gitTest = gitHelper.getGitTestInfo();

	beforeEach(() => {
		// use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'GithubAPI');
		repo = new GithubRepo(gitTest.config.repo, cacheDir, gitTest.opts);
	});
	afterEach(() => {
		repo = null;
	});

	var metaAssert = joiAssert.bake(Joi.object({
		meta: Joi.object({
			rate: Joi.object({
				lastUpdate: Joi.number().min(0),
				limit: Joi.number().min(0),
				remaining: Joi.number().min(0),
				reset: Joi.number().min(0),
				resetAt: Joi.string()
			})
		})
	}).options({
		convert: false,
		allowUnknown: true
	}).description('metaAssert'));

	function fixMeta(meta) {
		if (!meta.rate) {
			meta.rate = {};
		}
		meta.rate.lastUpdate = 0;
		meta.rate.limit = 0;
		meta.rate.remaining = 0;
		meta.rate.reset = 0;
		meta.rate.resetAt = '0:11:22';
	}

	it('should have default options', () => {
		assert.isFunction(GithubAPI, 'constructor');
		assert.isTrue(repo.api.cache.opts.cache.cacheRead, 'options.cacheRead');
		assert.isTrue(repo.api.cache.opts.cache.cacheWrite, 'options.cacheWrite');
		assert.isTrue(repo.api.cache.opts.cache.remoteRead, 'options.remoteRead');
	});

	describe('getBranches', () => {
		it('should cache and return data from store', () => {
			// repo.api.verbose = true;

			return repo.api.getBranches().then((first) => {
				assert.isArray(first, 'first data');

				// get again, should be cached
				return repo.api.getBranches().then((second) => {
					assert.isArray(second, 'second data');

					// same data?
					assert.deepEqual(first, second, 'first vs second');
				});
			});
		});
	});

	describe('getBlob', () => {
		it('should cache and return data from store', () => {
			// repo.api.verbose = true;

			var expectedJson = fileIO.readJSONSync(path.join(gitTest.fixtureDir, 'async-blob.json'));
			var expectedSha = expectedJson.sha;
			helper.assertFormatSHA1(expectedSha, 'expectedSha');

			return repo.api.getBlob(expectedSha).then((first) => {
				assert.isObject(first, 'first data');
				assert.strictEqual(first.sha, expectedSha, 'first.sha vs expectedSha');

				metaAssert(first);
				fixMeta(first.meta);
				assert.jsonOf(expectedJson, first, 'first vs expectedJson');

				var firstBuffer = GitUtil.decodeBlobJson(first);
				assert.instanceOf(firstBuffer, Buffer, 'buffer');

				var firstSha = GitUtil.blobShaHex(firstBuffer, 'utf8');
				assert.strictEqual(firstSha, expectedSha, 'firstSha vs expected');

				// get again, should be cached
				return repo.api.getBlob(expectedSha).then((second) => {
					assert.isObject(second, 'second data');
					assert.strictEqual(second.sha, expectedSha, 'second.sha vs expectedSha');

					var secondBuffer = GitUtil.decodeBlobJson(first);
					assert.instanceOf(secondBuffer, Buffer, 'buffer');
					var secondSha = GitUtil.blobShaHex(secondBuffer, 'utf8');
					assert.strictEqual(secondSha, expectedSha, 'secondSha vs expected');
				});
			});
		});
	});
});
