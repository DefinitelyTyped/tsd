///<reference path="../../../globals.ts" />
///<reference path="../../../../src/git/loader/GithubRaw.ts" />
///<reference path="../../../../src/tsd/context/Context.ts" />
///<reference path="helper.ts" />

describe('git.GithubRaw', () => {
	'use strict';

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var raw:git.GithubRaw;
	var context:tsd.Context;
	var repo:git.GithubRepo;

	var cacheDir:string;

	var gitTest = helper.getGitTestInfo();

	beforeEach(() => {
		//use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'GithubRaw', 'git-raw');

		repo = new git.GithubRepo(gitTest.config.repo.owner, gitTest.config.repo.project);
		raw = new git.GithubRaw(repo, cacheDir);
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
		assert.isFunction(git.GithubRaw, 'constructor');
	});

	it('should throw on bad params', () => {
		helper.assertError(() => {
			raw = new git.GithubRaw(null, null);
		}, 'expected "repo" to be defined as a GithubRepo(ownerName, projectName) but got null');
	});

	it('should have default options', () => {
		assert.isFunction(git.GithubRaw, 'constructor');
		assert.isTrue(raw.loader.options.cacheRead, 'options.cacheRead');
		assert.isTrue(raw.loader.options.cacheWrite, 'options.cacheWrite');
		assert.isTrue(raw.loader.options.remoteRead, 'options.remoteRead');
	});

	describe('getFile', () => {

		var filePath = gitTest.config.data.async.filePath;
		var commitSha = gitTest.config.data.async.commitSha;
		assert.isString(filePath, 'filePath');
		helper.assertFormatSHA1(commitSha, 'commitSha');

		it.eventually('should cache and return data', () => {
			//raw.debug = true;

			assert.isTrue(raw.stats.hasAllZero(), 'pretest stats');

			return raw.getFile(commitSha, filePath).then((firstData:NodeBuffer) => {
				assert.ok(firstData, 'first callback data');
				assert.instanceOf(firstData, Buffer, 'first callback data');
				assert.operator(firstData.length, '>', 0, 'first callback data');

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
					complete: 1,
					error: 0
				}, 'first: ' + commitSha);

				// get again, should be cached
				return raw.getFile(commitSha, filePath).then((secondData:NodeBuffer) => {
					assert.ok(secondData, 'second callback data');
					assert.instanceOf(secondData, Buffer, 'second callback data');
					assert.operator(secondData.length, '>', 0, 'second callback data');

					assert.strictEqual(firstData.toString('utf8'), secondData.toString('utf8'), 'first vs second data');

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
						'cache-hit': 1,
						error: 0
					}, 'second: ' + commitSha);
				});
			});
		});
	});
});
