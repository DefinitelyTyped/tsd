/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import log = require('../../xm/log');
import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');
import gitHelper = require('../../test/git/gitHelper');

import GitUtil = require('../../git/GitUtil');
import GithubRepo = require('../../git/GithubRepo');
import GithubAPI = require('../../git/loader/GithubAPI');

describe('GithubAPI', () => {
	'use strict';

	var repo: GithubRepo;
	var cacheDir: string;
	var gitTest = gitHelper.getGitTestInfo();

	beforeEach(() => {
		// use clean tmp folder in this test module
		cacheDir = path.join(gitTest.cacheDir, 'GithubAPI');
		repo = new GithubRepo(gitTest.config.repo, gitTest.cacheDir, gitTest.opts);
	});
	afterEach(() => {
		repo = null;
	});

	var num = {
		'type': 'number'
	};
	var str = {
		'type': 'string'
	};
	var metaFields = {
		'type': 'object',
		'properties': {
			'meta': {
				'type': 'object',
				'required': [
					'rate'
				],
				'properties': {
					'rate': {
						'required': [
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
		it('should cache and return data from store', () => {
			// repo.api.verbose = true;

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
		it('should cache and return data from store', () => {
			// repo.api.verbose = true;

			var expectedJson = fileIO.readJSONSync(path.join(gitTest.fixtureDir, 'async-blob.json'));
			var expectedSha = expectedJson.sha;
			helper.assertFormatSHA1(expectedSha, 'expectedSha');

			var notes = [];

			return repo.api.getBlob(expectedSha).then((first) => {
				assert.ok(first, 'first data');
				assert.isObject(first, 'first data');
				assert.strictEqual(first.sha, expectedSha, 'first.sha vs expectedSha');

				assert.jsonSchema(first, metaFields, 'first meta');
				fixMeta(first.meta);
				assert.jsonOf(expectedJson, first, 'first vs expectedJson');

				var firstBuffer = GitUtil.decodeBlobJson(first);
				assert.instanceOf(firstBuffer, Buffer, 'buffer');

				var firstSha = GitUtil.blobShaHex(firstBuffer, 'utf8');
				assert.strictEqual(firstSha, expectedSha, 'firstSha vs expected');

				// get again, should be cached
				return repo.api.getBlob(expectedSha).then((second) => {
					assert.ok(second, 'second data');
					assert.isObject(second, 'second data');
					assert.strictEqual(second.sha, expectedSha, 'second.sha vs expectedSha');

					var secondBuffer = GitUtil.decodeBlobJson(first);
					assert.instanceOf(secondBuffer, Buffer, 'buffer');
					var secondSha = GitUtil.blobShaHex(secondBuffer, 'utf8');
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
