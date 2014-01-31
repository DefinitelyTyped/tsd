/// <reference path='../../../globals.ts' />
/// <reference path='../../../../src/xm/hash.ts' />
/// <reference path='../../../../src/xm/file.ts' />

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

	describe('bulk', () => {
		var list = {
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

		Object.keys(list).forEach((name:string)=> {
			it('"' + name + '"', () => {
				var value = list[name];
				var base = xm.file.readFileSync(path.join(fixtures, name, 'base.d.ts'));
				var expected = xm.file.readFileSync(path.join(fixtures, name, 'result.d.ts'));

				var bundle = new tsd.Bundle(path.join(tmp, name, 'result.d.ts'));
				bundle.parse(base);
				if (xm.isFunction(value)) {
					value.call(null, bundle, name);
				}
				var actual = bundle.getContent();

				xm.file.writeFileSync(bundle.target, actual);

				assert.strictEqual(actual, expected, name);
			});
		});
	});
});
