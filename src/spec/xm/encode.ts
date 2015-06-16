/// <reference path="../../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;
import helper = require('../../test/helper');

import encode = require('../../xm/encode');

describe('encode', () => {
	describe('unprintNL', () => {
		it('should not modify if not matched', () => {
			assert.strictEqual(encode.unprintNL('aa'), 'aa');
		});
		it('should modify if matched', () => {
			assert.strictEqual(encode.unprintNL('a\na'), 'a\\na');
			assert.strictEqual(encode.unprintNL('a\r\na'), 'a\\r\\na');
		});
	});
	describe('unprintCC', () => {
		it('should not modify if not matched', () => {
			assert.strictEqual(encode.unprintCC('aa'), 'aa');
		});
		it('should modify if matched', () => {
			assert.strictEqual(encode.unprintCC('a\ba'), 'a\\ba');
			assert.strictEqual(encode.unprintCC('a\b\0a'), 'a\\b\\0a');
		});
	});
	describe('unprintNLS', () => {
		it('should not modify if not matched', () => {
			assert.strictEqual(encode.unprintNLS('aa'), 'aa');
		});
		it('should modify if matched', () => {
			assert.strictEqual(encode.unprintNLS('a\na'), 'a\\n\na');
			assert.strictEqual(encode.unprintNLS('a\r\na'), 'a\\r\\n\r\na');
		});
	});

	describe('wrapQuotes', () => {
		it('should wrap simple', () => {
			assert.strictEqual(encode.wrapQuotes('aa'), '\'aa\'');
			assert.strictEqual(encode.wrapQuotes('aa', false), '\'aa\'');
			assert.strictEqual(encode.wrapQuotes('aa', true), '"aa"');
		});
		it('should wrap complex', () => {
			assert.strictEqual(encode.wrapQuotes('a a'), '\'a a\'');
			assert.strictEqual(encode.wrapQuotes('a a', false), '\'a a\'');
			assert.strictEqual(encode.wrapQuotes('a a', true), '"a a"');
		});
	});

	describe('wrapIfComplex', () => {
		it('should not wrap if complex', () => {
			assert.strictEqual(encode.wrapIfComplex('aa'), 'aa');
			assert.strictEqual(encode.wrapIfComplex('aB'), 'aB');
		});
		it('should wrap if complex', () => {
			assert.strictEqual(encode.wrapIfComplex('a a'), '\'a a\'');
			assert.strictEqual(encode.wrapIfComplex('a a', false), '\'a a\'');
			assert.strictEqual(encode.wrapIfComplex('a a', true), '"a a"');
		});
	});

	describe('escapeControl', () => {
		it('should escape normal', () => {
			assert.strictEqual(encode.escapeControl('aa'), 'aa');
			assert.strictEqual(encode.escapeControl('a a a'), 'a a a');
			assert.strictEqual(encode.escapeControl('a a a', true), 'a a a');

		});
		it('should escape \\n', () => {
			assert.strictEqual(encode.escapeControl('\n'), '\\n');
			assert.strictEqual(encode.escapeControl('\n', true), '\\n\n');

		});
		it('should escape \\r', () => {
			assert.strictEqual(encode.escapeControl('\r'), '\\r');
			assert.strictEqual(encode.escapeControl('\r', true), '\\r\r');

		});
		it('should escape \\r\\n', () => {
			assert.strictEqual(encode.escapeControl('\r\n'), '\\r\\n');
			assert.strictEqual(encode.escapeControl('\r\n', true), '\\r\\n\r\n');
		});
	});

	describe('trim', () => {
		it('should trim', () => {
			assert.strictEqual(encode.trim('aaaaaaa', 4), 'aaaa...');
			assert.strictEqual(encode.trim('aaaaBBBB', 6), 'aaaaBB...');
		});
	});

	describe('trimWrap', () => {
		it('should trimWrap', () => {
			assert.strictEqual(encode.trimWrap('aaaaaaa', 4), '\'aaaa\'...');
			assert.strictEqual(encode.trimWrap('aaaaaaa', 4, false), '\'aaaa\'...');
			assert.strictEqual(encode.trimWrap('aaaaaaa', 4, true), '"aaaa"...');

			assert.strictEqual(encode.trimWrap('aaaaBBBB', 6), '\'aaaaBB\'...');
		});
		it('should trimWrap with escaping', () => {
			assert.strictEqual(encode.trimWrap('aa\naaaaa', 4), '\'aa\\na\'...');
			assert.strictEqual(encode.trimWrap('aa\naaaaa', 4, false), '\'aa\\na\'...');
			assert.strictEqual(encode.trimWrap('aa\naaaaa', 4, true), '"aa\\na"...');
		});
	});
});
