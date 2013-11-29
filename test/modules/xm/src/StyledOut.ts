///<reference path="../../../globals.ts" />
///<reference path="../../../../src/xm/StatCounter.ts" />
///<reference path="../../../../src/xm/io/StyledOut.ts" />
///<reference path="../../../../src/xm/io/FileUtil.ts" />

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
		data.span = getOutput((output:xm.StyledOut) => {
			return output.span(value);
		});
		data.block = getOutput((output:xm.StyledOut) => {
			return output.block(value);
		});
		data.clear = getOutput((output:xm.StyledOut) => {
			return output.clear();
		});
		data.ruler = getOutput((output:xm.StyledOut) => {
			return output.ruler();
		});
		data.ruler2 = getOutput((output:xm.StyledOut) => {
			return output.ruler2();
		});
		data.h1 = getOutput((output:xm.StyledOut) => {
			return output.h1(value);
		});
		data.h2 = getOutput((output:xm.StyledOut) => {
			return output.h2(value);
		});
		data.plain_empty = getOutput((output:xm.StyledOut) => {
			return output.plain(value);
		});
		data.accent = getOutput((output:xm.StyledOut) => {
			return output.accent(value);
		});
		data.space = getOutput((output:xm.StyledOut) => {
			return output.space();
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
		data.inspect_d0 = getOutput((output:xm.StyledOut) => {
			return output.inspect(value, 0);
		});
		data.inspect_d2 = getOutput((output:xm.StyledOut) => {
			return output.inspect(value, 1);
		});

		//output.unfunk()

		var file = name + '.json';

		xm.FileUtil.writeJSONSync(path.resolve(testPath, 'tmp', 'styledout', file), data);

		var expected = xm.FileUtil.readJSONSync(path.resolve(testPath, 'fixtures', 'styledout', file));
		assert.deepEqual(data, expected, name + ': stored results');
	}

	describe('methods', () => {
		xm.eachProp(tests, (test, name) => {
			it('"' + name + '""', () => {
				assertOutput(test, name);
			});
		});
	});
});
