/// <reference path="../../../globals.ts" />
/// <reference path="helper.ts" />
/// <reference path="../../../assert/git/_all.ts" />
/// <reference path="../../../../src/xm/hash.ts" />
/// <reference path="../../../../src/xm/iterate.ts" />
/// <reference path="../../../../src/git/GitUtil.ts" />
/// <reference path="../../../../src/git/GithubRepo.ts" />
/// <reference path="../../../../src/git/loader/GithubRaw.ts" />
/// <reference path="../../../../src/git/loader/GithubAPI.ts" />

describe('git.Github', () => {
	'use strict';

	var path = require('path');
	var FS:typeof QioFS = require('q-io/fs');
	var assert:Chai.Assert = require('chai').assert;

	var repo:git.GithubRepo;

	var cacheDir:string;

	var gitTest = helper.getGitTestInfo();

	beforeEach(() => {
		// use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'git-api');
		repo = new git.GithubRepo(gitTest.config.repo, gitTest.cacheDir);
	});

	afterEach(() => {
		repo = null;
	});

	it('pretest', () => {
		assert.instanceOf(repo, git.GithubRepo, 'repo');
		assert.instanceOf(repo.api, git.GithubAPI, 'api');
		assert.instanceOf(repo.raw, git.GithubRaw, 'raw');
	});

	xm.eachProp(gitTest.config.data, (test, label:string) => {
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

			return repo.raw.getBinary(commitSha, filePath).then((rawData:NodeBuffer) => {
				assert.ok(rawData, 'raw data');
				assert.instanceOf(rawData, Buffer, 'raw data');
				assert.operator(rawData.length, '>', 20, 'raw data');

				var rawSha = git.GitUtil.blobShaHex(rawData, 'utf8');
				helper.assertFormatSHA1(rawSha, 'rawSha');

				return repo.api.getBlob(blobSha).then((apiData) => {
					assert.ok(apiData, 'api data');
					assert.isObject(apiData, 'api data');

					var apiBuffer = git.GitUtil.decodeBlobJson(apiData);
					assert.instanceOf(apiBuffer, Buffer, 'api buffer');

					var apiSha = git.GitUtil.blobShaHex(apiBuffer);
					helper.assertFormatSHA1(apiSha, 'sha');

					assert.strictEqual(rawSha, blobSha, 'rawSha vs blobSha');
					assert.strictEqual(apiSha, rawSha, 'apiSha vs rawSha');

					// this explodes.. weird!
					// assert.strictEqual(apiBuffer, rawBuffer, 'api vs raw buffer');

					// temp hackish
					return xm.file.mkdirCheckQ(gitTest.extraDir, true).then(() => {
						return FS.write(path.join(gitTest.extraDir, 'tmp_test.bin'), rawData, {flags:'wb'});
					}).then(() => {
						return FS.read(path.join(gitTest.extraDir, 'tmp_test.bin'), {flags:'rb'});
					}, (err) => {
						xm.log.error('storage test failure');
						throw err;
					}).then((cycleData:NodeBuffer) => {
						assert.ok(rawData, 'raw data');
						assert.instanceOf(rawData, Buffer, 'raw data');

						var cycleSha = git.GitUtil.blobShaHex(cycleData);
						assert.strictEqual(cycleSha, rawSha, 'cycleSha vs rawData');
						assert.strictEqual(cycleSha, blobSha, 'cycleSha vs blobSha');
						assert.strictEqual(cycleSha, apiSha, 'cycleSha vs apiSha');
					});
				});
			});
		});
	});
});
