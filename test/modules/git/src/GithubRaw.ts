/// <reference path="../../../globals.ts" />
/// <reference path="../../../../src/git/loader/GithubRaw.ts" />
/// <reference path="../../../../src/tsd/context/Context.ts" />
/// <reference path="helper.ts" />

describe('git.GithubRaw', () => {
	'use strict';

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var repo:git.GithubRepo;
	var cacheDir:string;
	var gitTest = helper.getGitTestInfo();

	beforeEach(() => {
		// use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'GithubRaw');
		repo = new git.GithubRepo(gitTest.config.repo, cacheDir, gitTest.opts);
		helper.enableTrack(repo);
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

	describe('getFile commit', () => {
		it('should cache and return data', () => {
			// repo.raw.verbose = true;

			var filePath = gitTest.config.data.async.filePath;
			assert.isString(filePath, 'filePath');

			var commitSha = gitTest.config.data.async.commitSha;
			helper.assertFormatSHA1(commitSha, 'commitSha');

			var notes = [];

			return repo.raw.getBinary(commitSha, filePath).progress((note:any) => {
				notes.push(note);
			}).then((firstData:NodeBuffer) => {
				assert.instanceOf(firstData, Buffer, 'first callback data');
				assert.operator(firstData.length, '>', 0, 'first callback data');

				// get again, should be cached
				return repo.raw.getBinary(commitSha, filePath).progress((note:any) => {
					notes.push(note);
				}).then((secondData:NodeBuffer) => {
					assert.instanceOf(secondData, Buffer, 'second callback data');
					assert.strictEqual(firstData.toString('utf8'), secondData.toString('utf8'), 'first vs second data');

					repo.raw.track.complete('second');

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

			return repo.raw.getBinary(ref, filePath).progress((note:any) => {
				notes.push(note);
			}).then((firstData:NodeBuffer) => {
				assert.instanceOf(firstData, Buffer, 'first callback data');
				assert.operator(firstData.length, '>', 0, 'first callback data');

				// get again, should be cached
				return repo.raw.getBinary(ref, filePath).progress((note:any) => {
					notes.push(note);
				}).then((secondData:NodeBuffer) => {
					assert.instanceOf(secondData, Buffer, 'second callback data');
					assert.strictEqual(firstData.toString('utf8'), secondData.toString('utf8'), 'first vs second data');

					repo.raw.track.complete('second');

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
