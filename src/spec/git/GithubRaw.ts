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

import GitUtil = require('../../git/GitUtil');
import GithubRepo = require('../../git/GithubRepo');
import GithubRaw = require('../../git/loader/GithubRaw');

describe('GithubRaw', () => {
	'use strict';

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
		assert.isTrue(repo.raw.cache.opts.cacheRead, 'options.cacheRead');
		assert.isTrue(repo.raw.cache.opts.cacheWrite, 'options.cacheWrite');
		assert.isTrue(repo.raw.cache.opts.remoteRead, 'options.remoteRead');
	});

	describe('getFile commit', () => {
		it('should cache and return data', () => {
			// repo.raw.verbose = true;

			var filePath = gitTest.config.data.async.filePath;
			assert.isString(filePath, 'filePath');

			var commitSha = gitTest.config.data.async.commitSha;
			helper.assertFormatSHA1(commitSha, 'commitSha');

			var notes = [];

			return repo.raw.getBinary(commitSha, filePath).then((firstData: NodeBuffer) => {
				assert.instanceOf(firstData, Buffer, 'first callback data');
				assert.operator(firstData.length, '>', 0, 'first callback data');

				// get again, should be cached
				return repo.raw.getBinary(commitSha, filePath).then((secondData: NodeBuffer) => {
					assert.instanceOf(secondData, Buffer, 'second callback data');
					assert.strictEqual(firstData.toString('utf8'), secondData.toString('utf8'), 'first vs second data');

					helper.assertNotes(notes, [
						{
							message: /^remote: /,
							code: 'http 200'
						},
						{
							message: /^local: /,
							code: null
						}
					], 'second');
				});
			});
		});
	});

	describe('getFile ref', () => {
		it('should cache and return data', () => {
			// repo.raw.verbose = true;

			var filePath = gitTest.config.data.async.filePath;
			assert.isString(filePath, 'filePath');

			var ref = gitTest.config.repo.ref;
			assert.isString(ref, 'ref');

			var notes = [];

			return repo.raw.getBinary(ref, filePath).then((firstData: NodeBuffer) => {
				assert.instanceOf(firstData, Buffer, 'first callback data');
				assert.operator(firstData.length, '>', 0, 'first callback data');

				// get again, should be cached
				return repo.raw.getBinary(ref, filePath).then((secondData: NodeBuffer) => {
					assert.instanceOf(secondData, Buffer, 'second callback data');
					assert.strictEqual(firstData.toString('utf8'), secondData.toString('utf8'), 'first vs second data');

					/*helper.assertNotes(notes, [
						{
							message: /^remote: /,
							code: 'http 200'
						},
						{
							message: /^local: /,
							code: null
						}
					], 'second');*/
				});
			});
		});
	});
});
