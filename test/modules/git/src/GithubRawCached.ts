///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/git/GithubRawCached.ts" />
///<reference path="../../../../src/tsd/context/Context.ts" />
///<reference path="helper.ts" />

declare var gitTest;

describe('git.GithubRawCached', () => {
	'use strict';

	var raw:git.GithubRawCached;

	var context:tsd.Context;
	var repo:git.GithubRepo;

	var path = require('path');
	var cacheDir:string;

	beforeEach(() => {
		//use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'git_raw');

		repo = new git.GithubRepo(gitTest.config.repo.owner, gitTest.config.repo.project);
		raw = new git.GithubRawCached(repo, cacheDir);
	});
	afterEach(() => {
		context = null;
		repo = null;
		raw = null;
	});

	it('pretest', () => {
		assert.isString(gitTest.config.repo.owner, 'owner');
		assert.isString(gitTest.config.repo.project, 'project');
	});

	it('should be defined', () => {
		assert.isFunction(git.GithubRawCached, 'constructor');
	});

	it('should throw on bad params', () => {
		assert.throws(() => {
			raw = new git.GithubRawCached(null, null);
		});
	});

	it('should have default options', () => {
		assert.isFunction(git.GithubRawCached, 'constructor');
		assert.isTrue(raw.loader.options.cacheRead, 'options.cacheRead');
		assert.isTrue(raw.loader.options.cacheWrite, 'options.cacheWrite');
		assert.isTrue(raw.loader.options.remoteRead, 'options.remoteRead');
	});

	describe('getFile', () => {

		var filePath = gitTest.config.api.getFile.filePath;
		var commitSha = gitTest.config.api.getFile.blobSha;

		it('should cache and return data', () => {
			//raw.debug = true;

			assert.isTrue(raw.stats.hasAllZero(), 'pretest stats');

			return raw.getFile(commitSha, filePath).then((firstData) => {
				assert.ok(firstData, 'first callback data');
				assert.isString(firstData, 'first callback data');
				assert.operator(firstData.length, '>', 20, 'first callback data');

				//xm.log(raw.loader.stats.stats.export());
				helper.assertStatCounter(raw.loader.stats, {
					start: 1,
					'read-start': 1,
					'active-set': 1,
					'read-miss': 1,
					'load-start': 1,
					'load-success': 1,
					'write-start': 1,
					'write-success': 1,
					'active-remove': 1,
					complete: 1
				}, 'first');

				// get again, should be cached
				return raw.getFile(commitSha, filePath).then((secondData) => {
					assert.ok(secondData, 'second callback data');
					assert.isString(secondData, 'second callback data');
					assert.operator(secondData.length, '>', 20, 'second callback data');

					assert.strictEqual(firstData, secondData, 'first vs second data');

					//xm.log(raw.loader.stats.stats.export());
					helper.assertStatCounter(raw.loader.stats, {
						start: 2,
						'read-start': 2,
						'active-set': 2,
						'read-miss': 1,
						'load-start': 1,
						'load-success': 1,
						'write-start': 1,
						'write-success': 1,
						'active-remove': 2,
						complete: 2,
						'read-hit': 1,
						'cache-hit': 1
					}, 'second');

				});
			});
		});
	});
});
