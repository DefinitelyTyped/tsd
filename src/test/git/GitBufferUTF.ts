/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
import assert = chai.assert;

import GitUtil = require('../../git/GitUtil');

export function assertion(actual: Buffer, expected: Buffer, message: string) {
	assert.instanceOf(actual, Buffer, 'actual: ' + message);
	assert.instanceOf(expected, Buffer, 'expected: ' + message);

	var actualStr = actual.toString('utf8');
	var expectedStr = expected.toString('utf8');

	if (actualStr !== expectedStr) {
		// show fancy diffs
		var actualDebug = {
			sha: GitUtil.blobShaHex(actual, 'utf8'),
			str: actualStr
		};
		var expectedDebug = {
			sha: GitUtil.blobShaHex(expected, 'utf8'),
			str: expectedStr
		};
		assert.fail(actualDebug, expectedDebug, message);
	}
}
