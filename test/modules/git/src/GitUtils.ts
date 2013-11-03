///<reference path="../../../globals.ts" />
///<reference path="../../../../src/git/GitUtil.ts" />
///<reference path="helper.ts" />
///<reference path="../../../helper.ts" />

describe('git.GitUtils', () => {
	'use strict';

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var gitTest = helper.getGitTestInfo();

	describe('getDecodedBlob / blobSHABuffer', () => {
		it('should decode correct data', () => {

			var expectedJson = xm.FileUtil.readJSONSync(path.join(gitTest.fixtureDir, 'async-blob.json'));
			assert.isObject(expectedJson, 'expectedJson');
			var expectedSha = expectedJson.sha;
			helper.assertFormatSHA1(expectedSha, 'expectedSha');

			var buffer = git.GitUtil.decodeBlobJson(expectedJson);
			assert.instanceOf(buffer, Buffer, 'buffer');

			var sha = git.GitUtil.blobShaHex(buffer, 'utf8');
			helper.assertFormatSHA1(sha, 'sha');

			assert.strictEqual(sha, expectedSha, 'sha actual vs expected');
		});
	});
});
