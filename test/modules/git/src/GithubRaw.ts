///<reference path="../../../globals.ts" />
///<reference path="../../../../src/git/loader/GithubRaw.ts" />
///<reference path="../../../../src/tsd/context/Context.ts" />
///<reference path="helper.ts" />

describe('git.GithubRaw', () => {
	'use strict';

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var repo:git.GithubRepo;
	var cacheDir:string;
	var gitTest = helper.getGitTestInfo();

	beforeEach(() => {
		//use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'GithubRaw');
		repo = new git.GithubRepo(gitTest.config.repo.owner, gitTest.config.repo.project, cacheDir);
	});

	afterEach(() => {
		repo = null;
	});

	it('should have default options', () => {
		assert.isFunction(git.GithubRaw, 'constructor');
		assert.isTrue(repo.raw.cache.opts.cacheRead, 'options.cacheRead');
		assert.isTrue(repo.raw.cache.opts.cacheWrite, 'options.cacheWrite');
		assert.isTrue(repo.raw.cache.opts.remoteRead, 'options.remoteRead');
	});

	describe('getFile', () => {

		var filePath = gitTest.config.data.async.filePath;
		var commitSha = gitTest.config.data.async.commitSha;
		assert.isString(filePath, 'filePath');
		helper.assertFormatSHA1(commitSha, 'commitSha');

		it.eventually('should cache and return data', () => {
			//repo.raw.verbose = true;
			repo.raw.track.setTrack(true);
			repo.raw.cache.track.setTrack(true);
			repo.raw.track.reset();
			repo.raw.cache.track.reset();

			//assert.isTrue(raw.stats.hasAllZero(), 'pretest stats');

			repo.raw.track.start('first');

			return repo.raw.getBinary(commitSha, filePath).then((firstData:NodeBuffer) => {
				assert.ok(firstData, 'first callback data');
				assert.instanceOf(firstData, Buffer, 'first callback data');
				assert.operator(firstData.length, '>', 0, 'first callback data');

				repo.raw.track.complete('first');
				repo.raw.track.start('second');

				// get again, should be cached
				return repo.raw.getBinary(commitSha, filePath).then((secondData:NodeBuffer) => {
					assert.ok(secondData, 'second callback data');
					assert.instanceOf(secondData, Buffer, 'second callback data');
					assert.operator(secondData.length, '>', 0, 'second callback data');

					assert.strictEqual(firstData.toString('utf8'), secondData.toString('utf8'), 'first vs second data');

					repo.raw.track.complete('second');

					/*xm.log(repo.raw.track.getHistory());
					xm.log(repo.raw.track.getReport());

					xm.log(repo.raw.cache.track.getHistory());
					xm.log(repo.raw.cache.track.getReport());*/
				});
			});
		});
	});
});
