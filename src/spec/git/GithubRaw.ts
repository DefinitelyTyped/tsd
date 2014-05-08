/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import log = require('../../xm/log');
import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');
import gitHelper = require('../../test/git/gitHelper');

import GitUtil = require('../../git/gitUtil');
import GithubRepo = require('../../git/GithubRepo');
import GithubRaw = require('../../git/loader/GithubRaw');

describe('GithubRaw', () => {

	var repo: GithubRepo;
	var cacheDir: string;
	var gitTest = gitHelper.getGitTestInfo();

	beforeEach(() => {
		// use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'GithubRaw');
		repo = new GithubRepo(gitTest.config.repo, cacheDir, gitTest.opts);
	});

	afterEach(() => {
		repo = null;
	});

	it('should have default options', () => {
		assert.isFunction(GithubRaw, 'constructor');
		assert.isTrue(repo.raw.cache.opts.cache.cacheRead, 'options.cacheRead');
		assert.isTrue(repo.raw.cache.opts.cache.cacheWrite, 'options.cacheWrite');
		assert.isTrue(repo.raw.cache.opts.cache.remoteRead, 'options.remoteRead');
	});

	describe('getFile commit', () => {
		it('should be repeatable', () => {
			// repo.raw.verbose = true;

			var filePath = gitTest.config.data.async.filePath;
			assert.isString(filePath, 'filePath');

			var commitSha = gitTest.config.data.async.commitSha;
			helper.assertFormatSHA1(commitSha, 'commitSha');

			return repo.raw.getBinary(commitSha, filePath).then((firstData: Buffer) => {
				assert.instanceOf(firstData, Buffer, 'first callback data');
				assert.operator(firstData.length, '>', 0, 'first callback data');

				// get again, should be cached
				return repo.raw.getBinary(commitSha, filePath).then((secondData: Buffer) => {
					assert.instanceOf(secondData, Buffer, 'second callback data');
					assert.strictEqual(firstData.toString('utf8'), secondData.toString('utf8'), 'first vs second data');
				});
			});
		});
	});

	describe('getFile ref', () => {
		it('should be repeatable', () => {
			// repo.raw.verbose = true;

			var filePath = gitTest.config.data.async.filePath;
			assert.isString(filePath, 'filePath');

			var ref = gitTest.config.repo.ref;
			assert.isString(ref, 'ref');

			return repo.raw.getBinary(ref, filePath).then((firstData: Buffer) => {
				assert.instanceOf(firstData, Buffer, 'first callback data');
				assert.operator(firstData.length, '>', 0, 'first callback data');

				// get again, should be cached
				return repo.raw.getBinary(ref, filePath).then((secondData: Buffer) => {
					assert.instanceOf(secondData, Buffer, 'second callback data');
					assert.strictEqual(firstData.toString('utf8'), secondData.toString('utf8'), 'first vs second data');
				});
			});
		});
	});
});
