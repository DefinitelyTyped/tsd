///<reference path="../../helper.ts" />
///<reference path="../xm/unordered.ts" />
///<reference path="../../../src/git/GitUtil.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function assertGitBufferUTFEqual(actual:NodeBuffer, expected:NodeBuffer, message:string) {
		assert.instanceOf(actual, Buffer, 'actual: ' + message);
		assert.instanceOf(expected, Buffer, 'expected: ' + message);

		var actualStr = actual.toString('utf8');
		var expectedStr = expected.toString('utf8');

		if (actualStr !== expectedStr) {
			//show fancy diffs
			var actualDebug = {
				sha: git.GitUtil.blobShaHex(actual, 'utf8'),
				str: actualStr
			};
			var expectedDebug = {
				sha: git.GitUtil.blobShaHex(expected, 'utf8'),
				str: expectedStr
			};
			assert.fail(actualDebug, expectedDebug, message);
		}
	}
}
