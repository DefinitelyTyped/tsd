/// <reference path="../../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import stringUtils = require('../../xm/stringUtils');

describe('stringUtils', () => {
	describe.only('wordWrap', () => {
		it('wrap 4', () => {
			var test = 'aaaa bbbb cccc dddd eeee';

			var actual = stringUtils.wordWrap(test, 4);
			var expected = ['aaaa', 'bbbb', 'cccc', 'dddd', 'eeee'];

			assert.deepEqual(actual, expected);
		});

		it('wrap 6', () => {
			var test = 'aaaa bbbb cccc dddd eeee';

			var actual = stringUtils.wordWrap(test, 6);
			var expected = ['aaaa', 'bbbb', 'cccc', 'dddd', 'eeee'];

			assert.deepEqual(actual, expected);
		});

		it('wrap 10', () => {
			var test = 'aaaa bbbb cccc dddd eeee';

			var actual = stringUtils.wordWrap(test, 10);
			var expected = ['aaaa bbbb', 'cccc dddd', 'eeee'];

			assert.deepEqual(actual, expected);
		});

		it('wrap break 4', () => {
			var test = 'aaaa\nbbbb\ncccc\ndddd\neeee';

			var actual = stringUtils.wordWrap(test, 4);
			var expected = ['aaaa', 'bbbb', 'cccc', 'dddd', 'eeee'];

			assert.deepEqual(actual, expected);
		});

		it('wrap break mixed', () => {
			var test = 'aaaa\nbbbb cccc\ndddd eeee\n';

			var actual = stringUtils.wordWrap(test, 4);
			var expected = ['aaaa', 'bbbb', 'cccc', 'dddd', 'eeee', ''];

			assert.deepEqual(actual, expected);
		});

		it('wrap multi-break mixed', () => {
			var test = 'aaaa\n\nbbbb cccc\n\n\ndddd eeee\n';

			var actual = stringUtils.wordWrap(test, 6);
			var expected = ['aaaa', '', 'bbbb', 'cccc', '', '', 'dddd', 'eeee', ''];

			assert.deepEqual(actual, expected);
		});

		it('wrap break mixed trim', () => {
			var test = 'aaaa \n bbbb cccc \n dddd  eeee \n';

			var actual = stringUtils.wordWrap(test, 4);
			var expected = ['aaaa', 'bbbb', 'cccc', 'dddd', 'eeee', ''];

			assert.deepEqual(actual, expected);
		});
	});
});
