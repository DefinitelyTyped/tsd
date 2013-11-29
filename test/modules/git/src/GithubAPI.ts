///<reference path="../../../globals.ts" />
///<reference path="../../../../src/git/loader/GithubAPI.ts" />
///<reference path="../../../../src/git/GitUtil.ts" />
///<reference path="../../../../src/git/GitUtil.ts" />
///<reference path="../../../../src/tsd/context/Context.ts" />
///<reference path="helper.ts" />

describe('git.GithubAPI', () => {
	'use strict';

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var repo:git.GithubRepo;
	var cacheDir:string;
	var gitTest = helper.getGitTestInfo();

	beforeEach(() => {
		//use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'GithubAPI');
		repo = new git.GithubRepo(gitTest.config.repo.owner, gitTest.config.repo.project, gitTest.cacheDir);
	});
	afterEach(() => {
		repo = null;
	});

	describe.only('getBranches', () => {
		it.eventually('should cache and return data from store', () => {
			repo.api.verbose = true;
			repo.api.cache.track.reset();
			assert.strictEqual(repo.api.cache.track.getItems().length, 0, 'pretest stats');

			return repo.api.getBranches().then((first) => {
				assert.ok(first, 'first data');
				assert.isArray(first, 'first data');

				// get again, should be cached
				return repo.api.getBranches().then((second) => {
					assert.ok(second, 'second data');
					assert.isArray(second, 'second data');

					//same data?
					assert.deepEqual(first, second, 'first vs second');
				});
			});
		});
	});

	describe('getBlob', () => {
		it.eventually('should cache and return data from store', () => {
			//repo.api.verbose = true;
			repo.api.cache.track.reset();
			//assert.isTrue(api.loader.stats.hasAllZero(), 'pretest stats');

			var expectedJson = xm.FileUtil.readJSONSync(path.join(gitTest.fixtureDir, 'async-blob.json'));
			var expectedSha = expectedJson.sha;
			helper.assertFormatSHA1(expectedSha, 'expectedSha');

			return repo.api.getBlob(expectedSha).then((first) => {
				assert.ok(first, 'first data');
				assert.isObject(first, 'first data');


				assert.strictEqual(first.sha, expectedSha, 'first.sha vs expectedSha');

				first.meta['x-ratelimit-remaining'] = expectedJson.meta['x-ratelimit-remaining'];
				delete first.meta['x-ratelimit-reset'];

				assert.deepEqual(first, expectedJson, 'first vs expectedJson');

				var firstBuffer = git.GitUtil.decodeBlobJson(first);
				assert.instanceOf(firstBuffer, Buffer, 'buffer');

				var firstSha = git.GitUtil.blobShaHex(firstBuffer, 'utf8');
				assert.strictEqual(firstSha, expectedSha, 'firstSha vs expected');

				// get again, should be cached
				return repo.api.getBlob(expectedSha).then((second) => {
					assert.ok(second, 'second data');
					assert.isObject(second, 'second data');

					assert.strictEqual(second.sha, expectedSha, 'second.sha vs expectedSha');

					second.meta['x-ratelimit-remaining'] = first.meta['x-ratelimit-remaining'];
					delete second.meta['x-ratelimit-reset'];
					assert.deepEqual(first, second, 'first vs second');

					var secondBuffer = git.GitUtil.decodeBlobJson(first);
					assert.instanceOf(secondBuffer, Buffer, 'buffer');
					var secondSha = git.GitUtil.blobShaHex(secondBuffer, 'utf8');
					assert.strictEqual(secondSha, expectedSha, 'secondSha vs expected');
				});
			});
		});
	});
});
