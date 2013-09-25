///<reference path="../../../globals.ts" />
///<reference path="../../../../src/git/GitUtil.ts" />
///<reference path="helper.ts" />
///<reference path="../../../helper.ts" />

describe('git.GitUtils', () => {
	'use strict';

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	describe('getDecodedBlob / blobSHABuffer', () => {
		it('should decode correct data', () => {

			var expectedJson = xm.FileUtil.readJSONSync(path.join(gitTest.fixtureDir, 'blobResult.json'));
			assert.isObject(expectedJson, 'expectedJson');
			var expectedSha = expectedJson.sha;
			helper.isStringSHA1(expectedSha, 'expectedSha');

			var buffer = git.GitUtil.decodeBlob(expectedJson);
			assert.instanceOf(buffer, Buffer, 'buffer');

			var sha = git.GitUtil.blobSHAHex(buffer);
			helper.isStringSHA1(sha, 'sha');

			assert.strictEqual(sha, expectedSha, 'sha actual vs expected');
		});
	});
});
