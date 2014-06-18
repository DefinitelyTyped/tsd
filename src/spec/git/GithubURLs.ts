/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
var assert = chai.assert;

import fileIO = require('../../xm/fileIO');
import helper = require('../../test/helper');
import gitHelper = require('../../test/git/gitHelper');

import GitUtil = require('../../git/gitUtil');
import GithubURLs = require('../../git/GithubURLs');
import GithubRepo = require('../../git/GithubRepo');

describe('GithubRepo / GithubURLs', () => {

	var repo: GithubRepo;
	var urls: GithubURLs;

	var gitTest = gitHelper.getGitTestInfo();

	after(() => {
		repo = null;
		urls = null;
		gitTest = null;
	});

	describe('GithubRepo', () => {
		it('should be defined', () => {
			assert.isFunction(GithubRepo, 'GithubRepo.constructor');
		});
		it('should throw on bad params', () => {
			assert.throws(() => {
				repo = new GithubRepo({repoOwner: null, repoProject: null}, null, null);
			});
		});
		it('should be constructor', () => {
			repo = new GithubRepo({repoOwner: 'foo', repoProject: 'bar'}, 'baz', gitTest.opts);
			urls = repo.urls;
			assert.ok(urls, 'instance');
		});
	});

	describe('GithubURLs', () => {
		it('should be defined', () => {
			assert.isFunction(GithubURLs, 'GithubURLs.constructor');
		});
		it('should throw on bad params', () => {
			assert.throws(() => {
				urls = new GithubURLs(null);
			});
		});
		it('should return replaced urls', () => {
			urls = new GithubRepo({repoOwner: 'foo', repoProject: 'bar'}, 'baz', gitTest.opts).urls;
			var api = 'https://api.github.com/repos/foo/bar';
			var raw = 'https://raw.github.com/foo/bar';
			var base = 'https://github.com/foo/bar';
			var rawFile = raw + '/2ece23298f06d9fb45772fdb1d38086918c80f44/sub/folder/file.txt';
			assert.strictEqual(urls.api(), api, 'api');
			assert.strictEqual(urls.base(), base, 'base');
			assert.strictEqual(urls.rawFile('2ece23298f06d9fb45772fdb1d38086918c80f44', 'sub/folder/file.txt'), rawFile, 'rawFile');
		});
		it('should return correctly replaced urls if repoConfig is modified after repo creation', () => {
			var repoConfig = {repoOwner: 'foo', repoProject: 'bar'};
			urls = new GithubRepo(repoConfig, 'baz', gitTest.opts).urls;
			repoConfig.repoOwner = 'correctOwner';
			repoConfig.repoProject = 'correctProject';
			var api = 'https://api.github.com/repos/correctOwner/correctProject';
			var raw = 'https://raw.github.com/correctOwner/correctProject';
			var base = 'https://github.com/correctOwner/correctProject';
			assert.strictEqual(urls.api(), api, 'api');
			assert.strictEqual(urls.base(), base, 'base');
		});
		it('should return no trailing slash', () => {
			urls = new GithubRepo({repoOwner: 'foo', repoProject: 'bar'}, 'baz', gitTest.opts).urls;
			assert.notMatch(urls.apiBranches(), /\/$/, 'apiBranches');
			assert.notMatch(urls.apiBranch('abc'), /\/$/, 'apiBranch');
		});
	});
});
