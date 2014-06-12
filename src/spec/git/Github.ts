/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
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
import GithubAPI = require('../../git/loader/GithubAPI');
import GithubRaw = require('../../git/loader/GithubRaw');

describe('Github', () => {

	var repo: GithubRepo;
	var cacheDir: string;
	var gitTest = gitHelper.getGitTestInfo();

	beforeEach(() => {
		// use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'GithubRepo');
		repo = new GithubRepo(gitTest.config.repo, cacheDir, gitTest.opts);
		// helper.enableTrack(repo);
	});

	afterEach(() => {
		repo = null;
	});

	it('pretest', () => {
		assert.instanceOf(repo, GithubRepo, 'repo');
		assert.instanceOf(repo.api, GithubAPI, 'api');
		assert.instanceOf(repo.raw, GithubRaw, 'raw');
	});

	Object.keys(gitTest.config.data).forEach((label) => {
		var test = gitTest.config.data[label];
		if (test.skip) {
			return;
		}
		it('should return data raw identical to api: "' + label + '"', () => {
			// raw.debug = true;

			var filePath = test.filePath;
			var commitSha = test.commitSha;
			var blobSha = test.blobSha;

			assert.isString(filePath, 'filePath');
			helper.assertFormatSHA1(commitSha, 'commitSha');
			helper.assertFormatSHA1(blobSha, 'blobSha');

			return repo.raw.getBinary(commitSha, filePath).then((rawData: Buffer) => {
				assert.ok(rawData, 'raw data');
				assert.instanceOf(rawData, Buffer, 'raw data');
				assert.operator(rawData.length, '>', 20, 'raw data');

				var rawSha = GitUtil.blobShaHex(rawData);
				helper.assertFormatSHA1(rawSha, 'rawSha');

				return repo.api.getBlob(blobSha).then((apiData) => {
					assert.ok(apiData, 'api data');
					assert.isObject(apiData, 'api data');

					var apiBuffer = GitUtil.decodeBlobJson(apiData);
					assert.instanceOf(apiBuffer, Buffer, 'api buffer');

					var apiSha = GitUtil.blobShaHex(apiBuffer);
					helper.assertFormatSHA1(apiSha, 'sha');

					assert.strictEqual(rawSha, blobSha, 'rawSha vs blobSha');
					assert.strictEqual(apiSha, rawSha, 'apiSha vs rawSha');

					// this explodes.. weird!
					// assert.strictEqual(apiBuffer, rawBuffer, 'api vs raw buffer');
				});
			});
		});
	});
});
