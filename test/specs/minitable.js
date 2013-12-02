describe('minitable', function () {
	'use strict';

	var grunt = require('grunt');
	var chai = require('chai');
	chai.Assertion.includeStack = true;
	var assert = chai.assert;

	var miniwrite = require('miniwrite');
	var ministyle = require('ministyle');
	var minitable = require('../../lib/minitable/minitable');

	beforeEach(function () {
	});

	afterEach(function () {
	});

	it('builds simple table', function () {
		//TODO assert with miniwrite built-in assert (like ministyle etc do, when implemented)
		var buffer = miniwrite.buffer();
		var builder = minitable.getBuilder(buffer, ministyle.dev());
		assert.isObject(builder);

		var header = builder.createType('header', [
			{ name: 'main'}
		]);

		var table = builder.createType('table', [
			{ name: 'colA'},
			{ name: 'colB'},
			{ name: 'colC'}
		]);

		assert.isObject(header);
		assert.isObject(table);

		header.init();
		header.row.main.out.plain('A').sp().accent('B').ln();

		table.init();
		table.row.colA.out.plain('aa1').ln();
		table.row.colB.out.accent('bb1').ln();
		table.row.colC.out.plain('cc1').ln();

		table.next();
		table.row.colA.out.plain('aa2').ln();
		table.row.colB.out.accent('bb2').ln();
		table.row.colC.out.plain('cc2').ln();

		table.next();
		table.row.colA.out.plain('aa3').ln();
		table.row.colB.out.accent('bb3').ln();
		table.row.colC.out.plain('cc3').ln();

		builder.flush();

		var expected = [
			'[plain|A] [accnt|B]',
			'[plain|aa1][accnt|bb1][plain|cc1]',
			'[plain|aa2][accnt|bb2][plain|cc2]',
			'[plain|aa3][accnt|bb3][plain|cc3]'
		].join('\n');

		var actual = buffer.concat('\n', '', false);
		//console.log(actual);

		assert.deepEqual(actual, expected);
	});

	it('pads wider or missing rows', function () {
		var buffer = miniwrite.buffer();
		var builder = minitable.getBuilder(buffer, ministyle.plain());
		assert.isObject(builder);

		var table = builder.createType('table', [
			{ name: 'colA'},
			{ name: 'colB'},
			{ name: 'colC'}
		]);

		assert.isObject(table);

		table.init();
		table.row.colA.out.plain('aa1aa').ln();
		table.row.colB.out.accent('bb1').ln();
		table.row.colC.out.plain('cc1').ln();

		table.next();
		table.row.colA.out.plain('aa2').ln();
		table.row.colB.out.accent('bb2bb').ln();

		table.next();
		table.row.colA.out.plain('aa3').ln();
		table.row.colC.out.accent('cc1').ln();

		builder.flush();

		var expected = [
			'aa1aabb1  cc1',
			'aa2  bb2bb   ',
			'aa3       cc1'
		].join('\n');

		var actual = buffer.concat('\n', '', false);
		//console.log(actual);

		assert.deepEqual(actual, expected);
	});

	it('support multiline', function () {
		//TODO assert with miniwrite built-in assert (like ministyle etc do, when implemented)
		var buffer = miniwrite.buffer();
		var builder = minitable.getBuilder(buffer, ministyle.plain());
		assert.isObject(builder);

		var table = builder.createType('table', [
			{ name: 'colA'},
			{ name: 'colB'},
			{ name: 'colC'}
		]);

		assert.isObject(table);

		table.init();
		table.row.colA.out.plain('aa1\naa1').ln();
		table.row.colB.out.accent('bb1').ln();
		table.row.colC.out.plain('cc1').ln();

		table.next();
		table.row.colA.out.plain('aa2').ln();
		table.row.colB.out.accent('bb2\nbb21\nb2').ln();
		table.row.colC.out.plain('cc2').ln();

		table.next();
		table.row.colA.out.plain('aa3').ln();
		table.row.colB.out.accent('bb3').ln();
		table.row.colC.out.plain('cc3').ln().plain('cc3cc').ln();

		builder.flush();

		var expected = [
			'aa1bb1 cc1  ',
			'aa1         ',
			'aa2bb2 cc2  ',
			'   bb21     ',
			'   b2       ',
			'aa3bb3 cc3  ',
			'       cc3cc'
		].join('\n');

		var actual = buffer.concat('\n', '', false);
		//console.log(actual);

		assert.deepEqual(actual, expected);
	});

	it('supports halign', function () {
		//TODO assert with miniwrite built-in assert (like ministyle etc do, when implemented)
		var buffer = miniwrite.buffer();
		var builder = minitable.getBuilder(buffer, ministyle.plain());
		assert.isObject(builder);

		var table = builder.createType('table', [
			{ name: 'colA', halign: 'left'},
			{ name: 'colB', halign: 'center'},
			{ name: 'colC', halign: 'right'}
		]);

		assert.isObject(table);

		table.init();
		table.row.colA.out.plain('aa11aa').ln();
		table.row.colB.out.accent('bb11bb').ln();
		table.row.colC.out.plain('cc11cc').ln();

		table.next();
		table.row.colA.out.plain('aa').ln();
		table.row.colB.out.accent('bb').ln();
		table.row.colC.out.plain('cc').ln();

		builder.flush();

		var expected = [
			'aa11aabb11bbcc11cc',
			'aa      bb      cc'
		].join('\n');

		var actual = buffer.concat('\n', '', false);
		//console.log(actual);

		assert.deepEqual(actual, expected);
	});

	it('supports pinner/ outer acing', function () {
		//TODO assert with miniwrite built-in assert (like ministyle etc do, when implemented)
		var buffer = miniwrite.buffer();
		var builder = minitable.getBuilder(buffer, ministyle.plain());
		assert.isObject(builder);

		var table = builder.createType('table', [
			{
				name: 'colA',
				halign: 'left'
			},
			{
				name: 'colB',
				halign: 'center',
			},
			{
				name: 'colC',
				halign: 'right'
			}
		], {
			inner: ' | ',
			outer: '-'
		});

		assert.isObject(table);

		table.init();
		table.row.colA.out.plain('aa1').ln();
		table.row.colB.out.accent('bb1').ln();
		table.row.colC.out.plain('cc1').ln();

		table.next();
		table.row.colA.out.plain('aa2').ln();
		table.row.colB.out.accent('bb2').ln();
		table.row.colC.out.plain('cc2').ln();

		table.next();
		table.row.colA.out.plain('aa3').ln();
		table.row.colB.out.accent('bb3').ln();
		table.row.colC.out.plain('cc3').ln();

		builder.flush();

		var expected = [
			'-aa1 | bb1 | cc1-',
			'-aa2 | bb2 | cc2-',
			'-aa3 | bb3 | cc3-'
		].join('\n');

		var actual = buffer.concat('\n', '', false);
		//console.log(actual);

		assert.deepEqual(actual, expected);
	});

	it('supports row space', function () {
		//TODO assert with miniwrite built-in assert (like ministyle etc do, when implemented)
		var buffer = miniwrite.buffer();
		var builder = minitable.getBuilder(buffer, ministyle.plain());
		assert.isObject(builder);

		var table = builder.createType('table', [
			{
				name: 'colA',
				halign: 'left'
			},
			{
				name: 'colB',
				halign: 'center',
			},
			{
				name: 'colC',
				halign: 'right'
			}
		], {
			inner: ' | ',
			rowSpace: 1
		});

		assert.isObject(table);

		table.init();
		table.row.colA.out.plain('aa1').ln();
		table.row.colB.out.accent('bb1').ln();
		table.row.colC.out.plain('cc1').ln();

		table.next();
		table.row.colA.out.plain('aa2').ln();
		table.row.colB.out.accent('bb2').ln();
		table.row.colC.out.plain('cc2').ln();

		table.next();
		table.row.colA.out.plain('aa3').ln();
		table.row.colB.out.accent('bb3').ln();
		table.row.colC.out.plain('cc3').ln();

		builder.flush();

		var expected = [
			'aa1 | bb1 | cc1',
			'',
			'aa2 | bb2 | cc2',
			'',
			'aa3 | bb3 | cc3'
		].join('\n');

		var actual = buffer.concat('\n', '', false);
		//console.log(actual);

		assert.deepEqual(actual, expected);
	});

	it('supports multi line style', function () {
		//TODO assert with miniwrite built-in assert (like ministyle etc do, when implemented)
		var buffer = miniwrite.buffer();
		var builder = minitable.getBuilder(buffer, ministyle.dev());
		assert.isObject(builder);

		var table = builder.createType('table', [
			{
				name: 'colA'
			},
			{
				name: 'colB'
			},
			{
				name: 'colC'
			}
		]);

		assert.isObject(table);

		table.init();
		table.row.colA.out.plain('aa1').ln();
		table.row.colB.out.accent('bb1').ln();
		table.row.colC.out.plain('cc1').ln();

		table.next();
		table.row.colA.out.plain('aa2').ln().plain('aa2').ln();
		table.row.colB.out.accent('bb2').plain('bb2').accent('\nbb2\nbb2').ln();
		table.row.colC.out.plain('cc2\bcc2').ln();

		builder.flush();

		var expected = [
			'[plain|aa1][accnt|bb1]      [plain|cc1]    ',
			'[plain|aa2][accnt|bb2][plain|bb2][accnt|bb2][plain|cc2cc2]',
			'[plain|aa2][accnt|bb2]             '
		].join('\n');

		var actual = buffer.concat('\n', '', false);
		//console.log(actual);

		assert.deepEqual(actual, expected);
	});
});
