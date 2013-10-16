///<reference path="../../../globals.ts" />
///<reference path="../../../../src/xm/StatCounter.ts" />
///<reference path="../../../../src/xm/io/styler.ts" />
///<reference path="../../../../src/xm/io/FileUtil.ts" />

describe('xm.writer', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;
	var path = require('path');

	function standardTest(writer:xm.writer.TextWriter) {
		writer.start();
		writer.write('a');
		writer.write('');
		writer.write('b');
		writer.writeln('c');
		writer.writeln();
		writer.writeln('d');
		writer.finalise();
	}

	var expectedArr = ['abc', '', 'd'];
	var expectedStr = 'abc\n\nd\n';

	describe('LineWriter', () => {

		it('standard', () => {
			var actual = [];
			var writer = new xm.writer.LineWriter();
			writer.flushLine = (str:string) => {
				actual.push(str);
			};
			standardTest(writer);

			assert.deepEqual(actual, expectedArr);
		});

		it('write line ends', () => {
			var actual = [];
			var writer = new xm.writer.LineWriter();
			writer.flushLine = (str:string) => {
				actual.push(str);
			};
			writer.start();
			writer.write('a');
			writer.write('\n');
			writer.write('b');
			writer.write('\n\n');
			writer.write('c');
			writer.finalise();

			var expected = ['a', 'b', '', 'c'];

			assert.deepEqual(actual, expected);
		});
	});

	describe('ConsoleLineWriter', () => {
		var logOri;

		before(() => {
			logOri = console.log;
		});

		after(() => {
			console.log = logOri;
		});

		it('standard', () => {
			var actual = [];
			var writer = new xm.writer.ConsoleLineWriter();
			assert.instanceOf(writer, xm.writer.LineWriter);

			var logOri = console.log;
			console.log = function (str) {
				actual.push(arguments[0]);
			};
			standardTest(writer);
			console.log = logOri;

			assert.deepEqual(actual, expectedArr);
		});
	});
	describe('BufferWriter', () => {
		it('standard', () => {
			var writer = new xm.writer.BufferWriter();

			standardTest(writer);
			assert.strictEqual(writer.buffer, expectedStr);
		});
	});
});
