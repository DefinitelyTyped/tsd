/// <reference path='../../../globals.ts' />
/// <reference path='../../../../src/git/loader/GithubAPI.ts' />
/// <reference path='../../../../src/git/GitUtil.ts' />
/// <reference path='../../../../src/git/GitUtil.ts' />
/// <reference path='../../../../src/tsd/context/Context.ts' />
/// <reference path='helper.ts' />

describe('git.GithubAPI', () => {
	'use strict';

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var repo:git.GithubRepo;
	var cacheDir:string;
	var gitTest = helper.getGitTestInfo();

	beforeEach(() => {
		// use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'GithubAPI');
		repo = new git.GithubRepo(gitTest.config.repo, gitTest.cacheDir, gitTest.opts);
		helper.enableTrack(repo);
	});
	afterEach(() => {
		repo = null;
	});

	var num = {
		'type' : 'number'
	};
	var str = {
		'type' : 'string'
	};
	var metaFields = {
		'type' : 'object',
		'properties': {
			'meta': {
				'type' : 'object',
				'required' : [
					'rate'
				],
				'properties': {
					'rate': {
						'required' : [
							'lastUpdate',
							'limit',
							'remaining',
							'reset',
							'resetAt'
						],
						'properties': {
							'lastUpdate': num,
							'limit': num,
							'remaining': num,
							'reset': num,
							'resetAt': str
						}
					}
				}
			}
		}
	};

	function fixMeta(meta) {
		meta.rate.lastUpdate = 0;
		meta.rate.limit = 0;
		meta.rate.remaining = 0;
		meta.rate.reset = 0;
		meta.rate.resetAt = '0:11:22';
	}

	describe('getBranches', () => {
		it.eventually('should cache and return data from store', () => {
			// repo.api.verbose = true;
			repo.api.cache.track.reset();
			assert.strictEqual(repo.api.cache.track.getItems().length, 0, 'pretest stats');

			return repo.api.getBranches().then((first) => {
				assert.ok(first, 'first data');
				assert.isArray(first, 'first data');
				// assert.jsonSchema(first, metaFields, 'first meta');
				// fixMeta(first.meta);

				// get again, should be cached
				return repo.api.getBranches().then((second) => {
					assert.ok(second, 'second data');
					assert.isArray(second, 'second data');
					// assert.jsonSchema(second, metaFields, 'second meta');
					// fixMeta(second.meta);

					// same data?
					assert.deepEqual(first, second, 'first vs second');
				});
			});
		});
	});

	describe('getBlob', () => {
		it.eventually('should cache and return data from store', () => {
			// repo.api.verbose = true;
			repo.api.cache.track.reset();
			// assert.isTrue(api.loader.stats.hasAllZero(), 'pretest stats');

			var expectedJson = xm.file.readJSONSync(path.join(gitTest.fixtureDir, 'async-blob.json'));
			var expectedSha = expectedJson.sha;
			helper.assertFormatSHA1(expectedSha, 'expectedSha');

			var notes = [];

			return repo.api.getBlob(expectedSha).progress((note:any) => {
				notes.push(note);
			}).then((first) => {
				assert.ok(first, 'first data');
				assert.isObject(first, 'first data');
				assert.strictEqual(first.sha, expectedSha, 'first.sha vs expectedSha');

				assert.jsonSchema(first, metaFields, 'first meta');
				fixMeta(first.meta);
				assert.jsonOf(expectedJson, first, 'first vs expectedJson');

				var firstBuffer = git.GitUtil.decodeBlobJson(first);
				assert.instanceOf(firstBuffer, Buffer, 'buffer');

				var firstSha = git.GitUtil.blobShaHex(firstBuffer, 'utf8');
				assert.strictEqual(firstSha, expectedSha, 'firstSha vs expected');

				// get again, should be cached
				return repo.api.getBlob(expectedSha).progress((note:any) => {
					notes.push(note);
				}).then((second) => {
					assert.ok(second, 'second data');
					assert.isObject(second, 'second data');
					assert.strictEqual(second.sha, expectedSha, 'second.sha vs expectedSha');

					var secondBuffer = git.GitUtil.decodeBlobJson(first);
					assert.instanceOf(secondBuffer, Buffer, 'buffer');
					var secondSha = git.GitUtil.blobShaHex(secondBuffer, 'utf8');
					assert.strictEqual(secondSha, expectedSha, 'secondSha vs expected');

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
});
