describe('minichain', function () {
	'use strict';

	var grunt = require('grunt');
	var chai = require('chai');
	chai.Assertion.includeStack = true;
	var assert = chai.assert;


	var miniwrite = require('miniwrite');
	var ministyle = require('ministyle');
	var minitable = require('../../lib/minitable/minitable');

	var chain;
	var multi;

	afterEach(function () {
		chain = null;
		multi = null;
	});

	describe('table', function () {
		beforeEach(function () {

		});
	});
	describe('chain', function () {
		it('basic', function () {
			multi = minitable.getMultiChain({
				buffer: {
					write: miniwrite.buffer(),
					style: ministyle.plain()
				}
			});
			multi.chain.plain('aa').sp().error('bb').sp().success('cc').ln('');
			assert.deepEqual(multi.channels['buffer'].chars.target.lines, ['aa bb cc']);
		});
		it('mixed', function () {
			multi = minitable.getMultiChain({
				buffer: {
					write: miniwrite.buffer(),
					style: ministyle.plain()
				},
				dev: {
					write: miniwrite.log(),
					style: ministyle.dev()
				},
				ansi: {
					write: miniwrite.log(),
					style: ministyle.ansi()
				},
				css: {
					write: miniwrite.log(),
					style: ministyle.css()
				}
			});
			chain = multi.chain;

			chain.plain('aa').sp().error('bb').sp().success('cc').ln('');

			assert.deepEqual(multi.channels.buffer.chars.target.lines, ['aa bb cc']);
		});
	});
});
