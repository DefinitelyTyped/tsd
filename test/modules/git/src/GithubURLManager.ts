///<reference path="../../../globals.ts" />
///<reference path="../../../../src/git/GithubURLs.ts" />
///<reference path="helper.ts" />

describe('git.GithubRepo / git.GithubURLs', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	var repo:git.GithubRepo;
	var urls:git.GithubURLs;

	var gitTest = helper.getGitTestInfo();

	describe('GithubRepo', () => {
		it('should be defined', () => {
			assert.isFunction(git.GithubRepo, 'GithubRepo.constructor');
		});
		it('should throw on bad params', () => {
			assert.throws(() => {
				repo = new git.GithubRepo(null, null);
			});
		});
		it('should be constructor', () => {
			repo = new git.GithubRepo('foo', 'bar');
			urls = repo.urls;
			assert.ok(urls, 'instance');
		});
	});

	describe('GithubURLs', () => {
		it('should be defined', () => {
			assert.isFunction(git.GithubURLs, 'GithubURLs.constructor');
		});
		it('should throw on bad params', () => {
			assert.throws(() => {
				urls = new git.GithubURLs(null);
			});
		});
		it('should return replaced urls', () => {
			urls = new git.GithubRepo('foo', 'bar').urls;
			var api = 'https://api.github.com/repos/foo/bar';
			var raw = 'https://raw.github.com/foo/bar';
			var base = 'https://github.com/foo/bar';
			var rawFile = raw + '/af12345/sub/folder/file.txt';
			assert.strictEqual(urls.api(), api, 'api');
			assert.strictEqual(urls.base(), base, 'base');
			assert.strictEqual(urls.rawFile('af12345', 'sub/folder/file.txt'), rawFile, 'rawFile');
		});
	});
});
