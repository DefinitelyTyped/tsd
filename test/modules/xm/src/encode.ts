/// <reference path="../../../globals.ts" />
/// <reference path="../../../helper.ts" />
/// <reference path="../../../../src/xm/iterate.ts" />
/// <reference path="../../../../src/xm/assert.ts" />
/// <reference path="../../../../src/xm/encode.ts" />

describe('xm.encode', () => {

	var assert:Chai.Assert = require('chai').assert;

	describe('unprintNL', () => {
		it('should not modify if not matched', () => {
			assert.strictEqual(xm.unprintNL('aa'), 'aa');
		});
		it('should modify if matched', () => {
			assert.strictEqual(xm.unprintNL('a\na'), 'a\\na');
			assert.strictEqual(xm.unprintNL('a\r\na'), 'a\\r\\na');
		});
	});
	describe('unprintCC', () => {
		it('should not modify if not matched', () => {
			assert.strictEqual(xm.unprintCC('aa'), 'aa');
		});
		it('should modify if matched', () => {
			assert.strictEqual(xm.unprintCC('a\ba'), 'a\\ba');
			assert.strictEqual(xm.unprintCC('a\b\0a'), 'a\\b\\0a');
		});
	});
	describe('unprintNLS', () => {
		it('should not modify if not matched', () => {
			assert.strictEqual(xm.unprintNLS('aa'), 'aa');
		});
		it('should modify if matched', () => {
			assert.strictEqual(xm.unprintNLS('a\na'), 'a\\n\na');
			assert.strictEqual(xm.unprintNLS('a\r\na'), 'a\\r\\n\r\na');
		});
	});

	describe('wrapQuotes', () => {
		it('should wrap simple', () => {
			assert.strictEqual(xm.wrapQuotes('aa'), '\'aa\'');
			assert.strictEqual(xm.wrapQuotes('aa', false), '\'aa\'');
			assert.strictEqual(xm.wrapQuotes('aa', true), '"aa"');
		});
		it('should wrap complex', () => {
			assert.strictEqual(xm.wrapQuotes('a a'), '\'a a\'');
			assert.strictEqual(xm.wrapQuotes('a a', false), '\'a a\'');
			assert.strictEqual(xm.wrapQuotes('a a', true), '"a a"');
		});
	});

	describe('wrapIfComplex', () => {
		it('should not wrap if complex', () => {
			assert.strictEqual(xm.wrapIfComplex('aa'), 'aa');
			assert.strictEqual(xm.wrapIfComplex('aB'), 'aB');
		});
		it('should wrap if complex', () => {
			assert.strictEqual(xm.wrapIfComplex('a a'), '\'a a\'');
			assert.strictEqual(xm.wrapIfComplex('a a', false), '\'a a\'');
			assert.strictEqual(xm.wrapIfComplex('a a', true), '"a a"');
		});
	});

	describe('escapeControl', () => {
		it('should escape normal', () => {
			assert.strictEqual(xm.escapeControl('aa'), 'aa');
			assert.strictEqual(xm.escapeControl('a a a'), 'a a a');
			assert.strictEqual(xm.escapeControl('a a a', true), 'a a a');

		});
		it('should escape \\n', () => {
			assert.strictEqual(xm.escapeControl('\n'), '\\n');
			assert.strictEqual(xm.escapeControl('\n', true), '\\n\n');

		});
		it('should escape \\r', () => {
			assert.strictEqual(xm.escapeControl('\r'), '\\r');
			assert.strictEqual(xm.escapeControl('\r', true), '\\r\r');

		});
		it('should escape \\r\\n', () => {
			assert.strictEqual(xm.escapeControl('\r\n'), '\\r\\n');
			assert.strictEqual(xm.escapeControl('\r\n', true), '\\r\\n\r\n');
		});
	});

	describe('trim', () => {
		it('should trim', () => {
			assert.strictEqual(xm.trim('aaaaaaa', 4), 'aaaa...');
			assert.strictEqual(xm.trim('aaaaBBBB', 6), 'aaaaBB...');
		});
	});

	describe('trimWrap', () => {
		it('should trimWrap', () => {
			assert.strictEqual(xm.trimWrap('aaaaaaa', 4), '\'aaaa\'...');
			assert.strictEqual(xm.trimWrap('aaaaaaa', 4, false), '\'aaaa\'...');
			assert.strictEqual(xm.trimWrap('aaaaaaa', 4, true), '"aaaa"...');

			assert.strictEqual(xm.trimWrap('aaaaBBBB', 6), '\'aaaaBB\'...');
		});
		it('should trimWrap with escaping', () => {
			assert.strictEqual(xm.trimWrap('aa\naaaaa', 4), '\'aa\\na\'...');
			assert.strictEqual(xm.trimWrap('aa\naaaaa', 4, false), '\'aa\\na\'...');
			assert.strictEqual(xm.trimWrap('aa\naaaaa', 4, true), '"aa\\na"...');
		});
	});
});
