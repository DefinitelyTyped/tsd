/// <reference path="../../../globals.ts" />
/// <reference path="../../../../src/xm/lib/StatCounter.ts" />
/// <reference path="../../../../src/xm/lib/StyledOut.ts" />
/// <reference path="../../../../src/xm/file/file.ts" />

describe('xm.StyledOut', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;
	var path = require('path');

	var miniwrite = <typeof MiniWrite> require('miniwrite');
	var ministyle = <typeof MiniStyle> require('ministyle');

	var output:xm.StyledOut;

	beforeEach(() => {
	});

	afterEach(() => {
		output = null;
	});

	var tests:any = {
		'foo': 'foo'
	};

	var testPath = path.resolve('test', 'modules', 'xm');

	function getOutput(call:(output:xm.StyledOut) => xm.StyledOut):string {
		var write = miniwrite.buffer();
		var output = new xm.StyledOut(write, ministyle.dev());
		var ret = call(output);
		assert.strictEqual(output, ret, 'chained');
		output.getWrite().writeln('<end>');
		return write.concat();
	}

	function assertOutput(value, name) {

		var data:any = {};

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.write = getOutput((output:xm.StyledOut) => {
			return output.write(value);
		});
		data.line = getOutput((output:xm.StyledOut) => {
			return output.line(value);
		});
		data.line_opt = getOutput((output:xm.StyledOut) => {
			return output.line(undefined);
		});
		data.ln = getOutput((output:xm.StyledOut) => {
			return output.ln();
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.space = getOutput((output:xm.StyledOut) => {
			return output.space();
		});
		data.sp = getOutput((output:xm.StyledOut) => {
			return output.sp();
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.span = getOutput((output:xm.StyledOut) => {
			return output.span(value);
		});
		data.block = getOutput((output:xm.StyledOut) => {
			return output.block(value);
		});
		data.clear = getOutput((output:xm.StyledOut) => {
			return output.clear();
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.ruler = getOutput((output:xm.StyledOut) => {
			return output.ruler();
		});
		data.ruler_1 = getOutput((output:xm.StyledOut) => {
			return output.ruler(1);
		});
		data.ruler_2 = getOutput((output:xm.StyledOut) => {
			return output.ruler(2);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.heading = getOutput((output:xm.StyledOut) => {
			return output.heading(value);
		});
		data.heading_1 = getOutput((output:xm.StyledOut) => {
			return output.heading(value, 1);
		});
		data.heading_2 = getOutput((output:xm.StyledOut) => {
			return output.heading(value, 2);
		});
		data.heading_3 = getOutput((output:xm.StyledOut) => {
			return output.heading(value, 3);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.plain = getOutput((output:xm.StyledOut) => {
			return output.plain(value);
		});
		data.accent = getOutput((output:xm.StyledOut) => {
			return output.accent(value);
		});
		data.success = getOutput((output:xm.StyledOut) => {
			return output.success(value);
		});
		data.warning = getOutput((output:xm.StyledOut) => {
			return output.warning(value);
		});
		data.error = getOutput((output:xm.StyledOut) => {
			return output.error(value);
		});
		data.muted = getOutput((output:xm.StyledOut) => {
			return output.muted(value);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.cond = getOutput((output:xm.StyledOut) => {
			return output.cond(true, value);
		});
		data.cond_alt = getOutput((output:xm.StyledOut) => {
			return output.cond(true, value, 'bar');
		});
		data.cond_fail = getOutput((output:xm.StyledOut) => {
			return output.cond(false, value);
		});
		data.cond_fail_alt = getOutput((output:xm.StyledOut) => {
			return output.cond(false, value, 'bar');
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		data.inspect_d0 = getOutput((output:xm.StyledOut) => {
			return output.inspect(value, 0);
		});
		data.inspect_d2 = getOutput((output:xm.StyledOut) => {
			return output.inspect(value, 1);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.indent = getOutput((output:xm.StyledOut) => {
			return output.indent();
		});
		data.indent_1 = getOutput((output:xm.StyledOut) => {
			return output.indent(1);
		});
		data.indent_2 = getOutput((output:xm.StyledOut) => {
			return output.indent(2);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.label = getOutput((output:xm.StyledOut) => {
			return output.label(value);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


		data.bullet = getOutput((output:xm.StyledOut) => {
			return output.bullet();
		});
		data.bullet_accent = getOutput((output:xm.StyledOut) => {
			return output.bullet(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.bullet = getOutput((output:xm.StyledOut) => {
			return output.bullet();
		});
		data.bullet_accent = getOutput((output:xm.StyledOut) => {
			return output.bullet(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.index_1 = getOutput((output:xm.StyledOut) => {
			return output.index(1);
		});
		data.index_2 = getOutput((output:xm.StyledOut) => {
			return output.index(2);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.bullet = getOutput((output:xm.StyledOut) => {
			return output.bullet();
		});
		data.bullet_accent = getOutput((output:xm.StyledOut) => {
			return output.bullet(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.info = getOutput((output:xm.StyledOut) => {
			return output.info();
		});
		data.info_accent = getOutput((output:xm.StyledOut) => {
			return output.info(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.report = getOutput((output:xm.StyledOut) => {
			return output.bullet();
		});
		data.report_accent = getOutput((output:xm.StyledOut) => {
			return output.report(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		data.note = getOutput((output:xm.StyledOut) => {
			return output.note();
		});
		data.report_note = getOutput((output:xm.StyledOut) => {
			return output.note(true);
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// output.unfunk()

		var file = name + '.json';

		fileIO.writeJSONSync(path.resolve(testPath, 'tmp', 'styledout', file), data);

		var expected = xm.file.readJSONSync(path.resolve(testPath, 'fixtures', 'styledout', file));
		// test all in one
		assert.deepEqual(data, expected, name + ': results');
	}

	describe('methods', () => {
		xm.eachProp(tests, (test, name) => {
			it('"' + name + '""', () => {
				assertOutput(test, name);
			});
		});
	});
});
