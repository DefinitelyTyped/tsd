///<reference path="../../../globals.ts" />
///<reference path="../../../../src/xm/StatCounter.ts" />
///<reference path="../../../../src/xm/styler.ts" />
///<reference path="../../../../src/xm/io/FileUtil.ts" />

describe('xm.styler', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;
	var path = require('path');

	describe('additional exports', () => {
		//more?
		it('htmlWrapTable', () => {
			assert.isObject(xm.styler.htmlWrapTable, 'htmlWrapTable');
		});
		it('ansiWrapTable', () => {
			assert.isObject(xm.styler.ansiWrapTable, 'ansiWrapTable');
		});
	});

	var subjects:any = {
		'NoStyler': {
			styler: new xm.styler.NoStyler()
		},
		'PlainStyler': {
			styler: new xm.styler.PlainStyler()
		},
		'ANSIStyler': {
			styler: new xm.styler.ANSIStyler()
		},
		'ANSIWrapStyler': {
			styler: new xm.styler.ANSIWrapStyler()
		},
		'HTMLWrapStyler': {
			styler: new xm.styler.HTMLWrapStyler()
		},
		'CSSStyler': {
			styler: new xm.styler.CSSStyler()
		},
		'DevStyler': {
			styler: new xm.styler.DevStyler()
		}
	};

	var tests:any = {
		'foo': 'foo'
	};

	var testPath = path.resolve('test', 'modules', 'xm');

	function assertStyler(styler:xm.styler.Styler, stylerName, value, name) {

		var data:any = {};
		data.ok = styler.ok(value);
		data.fail = styler.fail(value);
		data.warn = styler.warn(value);
		data.error = styler.error(value);
		data.warning = styler.warning(value);
		data.success = styler.success(value);
		data.accent = styler.accent(value);
		data.plain = styler.plain(value);
		data.zero = styler.zero(value);

		var file = stylerName + '-' + name + '.json';

		xm.FileUtil.writeJSONSync(path.resolve(testPath, 'tmp', 'styler', file), data);

		var expected = xm.FileUtil.readJSONSync(path.resolve(testPath, 'fixtures', 'styler', file));
		assert.deepEqual(data, expected, name + ': stored results');
	}

	describe('versions', () => {
		xm.eachProp(subjects, (subject, stylerName) => {
			it('' + stylerName, () => {
				assert.isObject(subject.styler, stylerName + ': object');

				xm.eachProp(tests, (test, name) => {
					assertStyler(subject.styler, stylerName, test, name);
				});
			});
		});
	});
});
