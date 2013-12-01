describe('miniformat', function () {
	'use strict';

	var grunt = require('grunt');
	var chai = require('chai');
	chai.Assertion.includeStack = true;
	var assert = chai.assert;


	var miniwrite = require('miniwrite');
	var ministyle = require('ministyle');
	var miniformat = require('../../lib/miniformat/miniformat');

	var chain;
	var multi;

	afterEach(function () {
		chain = null;
		multi = null;
	});

	describe('chain', function () {
		it('basic', function () {
			multi = miniformat.getMultiChain({
				buffer: {
					write: miniwrite.buffer(),
					style: ministyle.plain()
				}
			});
			multi.out.plain('aa').sp().error('bb').sp().success('cc').ln('');
			assert.deepEqual(multi.channels['buffer'].chars.target.lines, ['aa bb cc']);
		});
		it('mixed', function () {

			multi = miniformat.getMultiChain({
				plain: {
					write: miniwrite.chars(miniwrite.buffer()),
					style: ministyle.plain()
				},
				buffer: {
					write: miniwrite.buffer(),
					style: ministyle.plain()
				},
				dev: {
					write: miniwrite.multi([miniwrite.buffer(), miniwrite.log()]),
					style: ministyle.dev()
				},
				ansi: {
					write: miniwrite.log(),
					style: ministyle.ansi()
				},
				css: {
					write: miniwrite.log(),
					style: ministyle.css()
				},
				split: {
					write: miniwrite.splitter(miniwrite.buffer(), / +/g),
					style: ministyle.plain()
				}
			});

			multi.out.plain('aa').sp().error('bb').sp().success('cc').ln();

			assert.deepEqual(multi.channels.buffer.chars.target.lines, ['aa bb cc']);
			//boooya!
			assert.deepEqual(multi.channels.split.chars.target.target.lines, ['aa', 'bb', 'cc']);
			assert.deepEqual(multi.channels.dev.chars.target.targets[0].lines, ['[plain|aa] [error|bb] [success|cc]']);
		});
	});
});
