/// <reference path="../../_ref.d.ts" />

'use strict';

import path = require('path');
import miniwrite = require('miniwrite');
import ministyle = require('ministyle');
import chai = require('chai');
var assert = chai.assert;
import helper = require('../../test/helper');

import StyledOut = require('../../xm/lib/StyledOut');
import fileIO = require('../../xm/file/fileIO');
import collection = require('../../xm/collection');

describe('StyledOut', () => {

	var output: StyledOut;

	beforeEach(() => {
	});

	afterEach(() => {
		output = null;
	});

	var tests: any = {
		'foo': 'foo'
	};

	var testPath = path.resolve('test', 'spec', 'xm');

	function getOutput(call: (output: StyledOut) => StyledOut): string {
		var write = miniwrite.buffer();
		var output = new StyledOut(write, ministyle.dev());
		var ret = call(output);
		assert.strictEqual(output, ret, 'chained');
		output.getWrite().writeln('<end>');
		return write.concat();
	}

	function assertOutput(value, name) {

		var data: any = {};

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.write = getOutput((output: StyledOut) => {
			return output.write(value);
		});
		data.line = getOutput((output: StyledOut) => {
			return output.line(value);
		});
		data.line_opt = getOutput((output: StyledOut) => {
			return output.line(undefined);
		});
		data.ln = getOutput((output: StyledOut) => {
			return output.ln();
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.space = getOutput((output: StyledOut) => {
			return output.space();
		});
		data.sp = getOutput((output: StyledOut) => {
			return output.sp();
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.span = getOutput((output: StyledOut) => {
			return output.span(value);
		});
		data.block = getOutput((output: StyledOut) => {
			return output.block(value);
		});
		data.clear = getOutput((output: StyledOut) => {
			return output.clear();
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.ruler = getOutput((output: StyledOut) => {
			return output.ruler();
		});
		data.ruler_1 = getOutput((output: StyledOut) => {
			return output.ruler(1);
		});
		data.ruler_2 = getOutput((output: StyledOut) => {
			return output.ruler(2);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.heading = getOutput((output: StyledOut) => {
			return output.heading(value);
		});
		data.heading_1 = getOutput((output: StyledOut) => {
			return output.heading(value, 1);
		});
		data.heading_2 = getOutput((output: StyledOut) => {
			return output.heading(value, 2);
		});
		data.heading_3 = getOutput((output: StyledOut) => {
			return output.heading(value, 3);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.plain = getOutput((output: StyledOut) => {
			return output.plain(value);
		});
		data.accent = getOutput((output: StyledOut) => {
			return output.accent(value);
		});
		data.success = getOutput((output: StyledOut) => {
			return output.success(value);
		});
		data.warning = getOutput((output: StyledOut) => {
			return output.warning(value);
		});
		data.error = getOutput((output: StyledOut) => {
			return output.error(value);
		});
		data.muted = getOutput((output: StyledOut) => {
			return output.muted(value);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.cond = getOutput((output: StyledOut) => {
			return output.cond(true, value);
		});
		data.cond_alt = getOutput((output: StyledOut) => {
			return output.cond(true, value, 'bar');
		});
		data.cond_fail = getOutput((output: StyledOut) => {
			return output.cond(false, value);
		});
		data.cond_fail_alt = getOutput((output: StyledOut) => {
			return output.cond(false, value, 'bar');
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		data.inspect_d0 = getOutput((output: StyledOut) => {
			return output.inspect(value, 0);
		});
		data.inspect_d2 = getOutput((output: StyledOut) => {
			return output.inspect(value, 1);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.indent = getOutput((output: StyledOut) => {
			return output.indent();
		});
		data.indent_1 = getOutput((output: StyledOut) => {
			return output.indent(1);
		});
		data.indent_2 = getOutput((output: StyledOut) => {
			return output.indent(2);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.label = getOutput((output: StyledOut) => {
			return output.label(value);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


		data.bullet = getOutput((output: StyledOut) => {
			return output.bullet();
		});
		data.bullet_accent = getOutput((output: StyledOut) => {
			return output.bullet(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.bullet = getOutput((output: StyledOut) => {
			return output.bullet();
		});
		data.bullet_accent = getOutput((output: StyledOut) => {
			return output.bullet(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.index_1 = getOutput((output: StyledOut) => {
			return output.index(1);
		});
		data.index_2 = getOutput((output: StyledOut) => {
			return output.index(2);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.bullet = getOutput((output: StyledOut) => {
			return output.bullet();
		});
		data.bullet_accent = getOutput((output: StyledOut) => {
			return output.bullet(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.info = getOutput((output: StyledOut) => {
			return output.info();
		});
		data.info_accent = getOutput((output: StyledOut) => {
			return output.info(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.report = getOutput((output: StyledOut) => {
			return output.bullet();
		});
		data.report_accent = getOutput((output: StyledOut) => {
			return output.report(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.note = getOutput((output: StyledOut) => {
			return output.note();
		});
		data.report_note = getOutput((output: StyledOut) => {
			return output.note(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// output.unfunk()

		var file = name + '.json';

		fileIO.writeJSONSync(path.resolve(testPath, 'tmp', 'styledout', file), data);

		var expected = fileIO.readJSONSync(path.resolve(testPath, 'fixtures', 'styledout', file));
		// test all in one
		assert.deepEqual(data, expected, name + ': results');
	}

	describe('methods', () => {
		Object.keys(tests).forEach((name) => {
			it('"' + name + '""', () => {
				assertOutput(tests[name], name);
			});
		});
	});
});
