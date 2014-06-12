/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import log = require('../../xm/log');
import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');
import gitHelper = require('../../test/git/gitHelper');

import GitUtil = require('../../git/gitUtil');

describe('GitUtils', () => {

	var gitTest = gitHelper.getGitTestInfo();

	describe('getDecodedBlob / blobSHABuffer', () => {
		it('should decode correct data', () => {

			var expectedJson = fileIO.readJSONSync(path.join(gitTest.fixtureDir, 'async-blob.json'));
			assert.isObject(expectedJson, 'expectedJson');
			var expectedSha = expectedJson.sha;
			helper.assertFormatSHA1(expectedSha, 'expectedSha');

			var buffer = GitUtil.decodeBlobJson(expectedJson);
			assert.instanceOf(buffer, Buffer, 'buffer');

			var sha = GitUtil.blobShaHex(buffer);
			helper.assertFormatSHA1(sha, 'sha');

			assert.strictEqual(sha, expectedSha, 'sha actual vs expected');
		});
	});
});
