describe('minitable', function () {
	'use strict';

	var grunt = require('grunt');
	var chai = require('chai');
	chai.Assertion.includeStack = true;
	var assert = chai.assert;


	var miniwrite = require('miniwrite');
	var ministyle = require('ministyle');
	var minitable = require('../../lib/minitable/minitable');
	var miniformat = require('../../lib/miniformat/miniformat');

	var table;
	var builder;
	var buffer;
	var style;
	var chain;
	var multi;

	afterEach(function () {
		table = null;
		builder = null;
		chain = null;
		multi = null;
	});

	it('builds simple table', function () {
		buffer = miniwrite.buffer();
		style = ministyle.ansi();
		builder = minitable.getBuilder(buffer, style);
		assert.isObject(builder);
		//TODO assert built-in assert (when implemented)

		var main = builder.createType('main', [
			{name: 'left'}
		]);
		var table = builder.createType('table', [
			{   name: 'command'},
			{   name: 'separator',
				halign: 'center'},
			{   name: 'label',
				halign: 'right',
				inner: '   '
			}
		], {
			outer: '  ',
			inner: '  |  '
		});
		main.init();
		main.row.left.out.plain('hello!').sp().accent('nice!').ln();

		table.init();
		table.row.command.out.plain('row 1 main').ln();
		table.row.separator.out.accent('row 1 sep').ln();
		table.row.label.out.plain('row 1 sep').ln();

		table.next();
		table.row.command.out.plain('row 2 main').ln();
		table.row.separator.out.accent('sep').ln();
		table.row.label.out.plain('row 2').ln();

		table.next();
		table.row.command.out.plain('row 3').ln();
		table.row.separator.out.accent('row 3 sep').ln();
		table.row.label.out.plain('row 3 sep\nrow 3 sep').ln();

		main.init();
		main.row.left.out.warning('wassup?!').ln();

		table.next();
		table.row.command.out.plain('row 4').ln();
		table.row.separator.out.accent('row 4\nrow 4').ln();
		table.row.label.out.plain('row 4').ln();


		builder.flush();

		miniwrite.log().writeln(buffer.concat('\n', '', false));
	});
});
