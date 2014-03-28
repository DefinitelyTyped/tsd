/// <reference path='../../../globals.ts' />
/// <reference path='../../../../src/xm/hash.ts' />
/// <reference path='../../../../src/xm/file.ts' />
/// <reference path='../../../../src/xm/Logger.ts' />

/// <reference path='../../../../src/tsd/support/Bundle.ts' />

describe.only('Bundle', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var fixtures = path.join(helper.getDirNameFixtures(), 'bundle');
	var tmp = path.join(helper.getDirNameTmp(), 'bundle');

	it('is constructor', () => {
		assert.isFunction(tsd.Bundle);
	});

	describe('mangle paths', () => {
		it('same dir', () => {
			var p = path.resolve(tmp, 'result.d.ts');
			var bundle = new tsd.Bundle(p);
			bundle.append('aa/bb.d.ts');
			var actual = bundle.getContent();
			var expected = '/// <reference path="aa/bb.d.ts" />\n';
			assert.strictEqual(actual, expected);
		});

		it('relative up', () => {
			var p = path.resolve(tmp, 'result.d.ts');
			var bundle = new tsd.Bundle(p);
			bundle.append('../aa/bb.d.ts');
			var actual = bundle.getContent();
			var expected = '/// <reference path="../aa/bb.d.ts" />\n';
			assert.strictEqual(actual, expected);
		});

		it('absolute', () => {
			var p = path.resolve(tmp, 'result.d.ts');
			var bundle = new tsd.Bundle(p);
			bundle.append(path.resolve(tmp, 'aa/bb.d.ts'));
			var actual = bundle.getContent();
			var expected = '/// <reference path="aa/bb.d.ts" />\n';
			assert.strictEqual(actual, expected);
		});

		it('different baseDir', () => {
			var p = path.resolve(tmp, 'result.d.ts');
			var d = path.resolve(tmp, '..', 'alt');
			var bundle = new tsd.Bundle(p, d);
			bundle.append('aa/bb.d.ts');
			var actual = bundle.getContent();
			var expected = '/// <reference path="../alt/aa/bb.d.ts" />\n';
			assert.strictEqual(actual, expected);
		});
	});

	describe('bulk', () => {
		var list = {
			'create-single': (bundle:tsd.Bundle) => {
				bundle.append('tango.d.ts');
			},
			'create-multi': (bundle:tsd.Bundle) => {
				bundle.append('tango.d.ts');
				bundle.append('victor.d.ts');
			},
			'noop-single': null,
			'noop-multi': null,
			'noop-footer': null,
			'noop-header': null,
			'noop-mixed': null,
			'append-single': (bundle:tsd.Bundle) => {
				bundle.append('tango.d.ts');
			},
			'append-multi': (bundle:tsd.Bundle) => {
				bundle.append('tango.d.ts');
				bundle.append('victor.d.ts');
			},
			'append-empty': (bundle:tsd.Bundle) => {
				bundle.append('tango.d.ts');
			},
			'remove-single': (bundle:tsd.Bundle) => {
				bundle.remove('tango.d.ts');
			},
			'remove-multi': (bundle:tsd.Bundle) => {
				bundle.remove('tango.d.ts');
				bundle.remove('victor.d.ts');
			}
		};

		Object.keys(list).forEach((name:string) => {
			it('"' + name + '"', () => {
				var value = list[name];
				var base = '';
				var src = path.join(fixtures, name, 'base.d.ts');
				var bundle = new tsd.Bundle(path.join(tmp, name, 'result.d.ts'));
				if (fs.existsSync(src)) {
					base = xm.file.readFileSync(src);
					bundle.parse(base);
				}
				var expected = xm.file.readFileSync(path.join(fixtures, name, 'result.d.ts'));

				if (xm.isFunction(value)) {
					 // do it
					value.call(null, bundle, name);
				}
				var actual = bundle.getContent();

				xm.file.writeFileSync(bundle.target, actual);

				assert.strictEqual(actual, expected, name);
			});
		});
	});
});
