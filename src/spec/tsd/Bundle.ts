/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
var assert = chai.assert;

import typeOf = require('../../xm/typeOf');
import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');

import tsdHelper = require('../../test/tsdHelper');
import Bundle = require('../../tsd/support/Bundle');

describe('Bundle', () => {

	var fixtures = path.join(helper.getDirNameFixtures(), 'bundle');
	var tmp = path.join(helper.getDirNameTmp(), 'bundle');

	it('is constructor', () => {
		assert.isFunction(Bundle);
	});

	describe('mangle paths', () => {
		it('same dir', () => {
			var p = path.resolve(tmp, 'result.d.ts');
			var bundle = new Bundle(p);
			bundle.append('aa/bb.d.ts');

			assert.isTrue(bundle.has('aa/bb.d.ts'));
			assert.isTrue(bundle.has(path.resolve(tmp, 'aa/bb.d.ts')));

			var actual = bundle.stringify();
			var expected = '/// <reference path="aa/bb.d.ts" />\n';
			assert.strictEqual(actual, expected);
		});

		it('relative up', () => {
			var p = path.resolve(tmp, 'result.d.ts');
			var bundle = new Bundle(p);
			bundle.append('../aa/bb.d.ts');

			assert.isTrue(bundle.has(path.resolve(tmp, '..', 'aa/bb.d.ts')));

			var actual = bundle.stringify();
			var expected = '/// <reference path="../aa/bb.d.ts" />\n';
			assert.strictEqual(actual, expected);
		});

		it('absolute', () => {
			var p = path.resolve(tmp, 'result.d.ts');
			var bundle = new Bundle(p);
			bundle.append(path.resolve(tmp, 'aa/bb.d.ts'));

			assert.isTrue(bundle.has('aa/bb.d.ts'));
			assert.isTrue(bundle.has(path.resolve(tmp, 'aa/bb.d.ts')));

			var actual = bundle.stringify();
			var expected = '/// <reference path="aa/bb.d.ts" />\n';
			assert.strictEqual(actual, expected);
		});

		it('different baseDir', () => {
			var p = path.resolve(tmp, 'result.d.ts');
			var d = path.resolve(tmp, '..', 'alt');
			var bundle = new Bundle(p, d);
			bundle.append('aa/bb.d.ts');

			assert.isTrue(bundle.has('aa/bb.d.ts'));
			assert.isTrue(bundle.has(path.resolve(tmp, '../alt/aa/bb.d.ts')));

			var actual = bundle.stringify();
			var expected = '/// <reference path="../alt/aa/bb.d.ts" />\n';
			assert.strictEqual(actual, expected);
		});

		it('different baseDir absolute', () => {
			var p = path.resolve(tmp, 'result.d.ts');
			var d = path.resolve(tmp, '..', 'alt');
			var bundle = new Bundle(p, d);
			bundle.append(path.resolve(tmp, 'aa/bb.d.ts'));

			assert.isTrue(bundle.has(path.resolve(tmp, 'aa/bb.d.ts')));

			var actual = bundle.stringify();
			var expected = '/// <reference path="aa/bb.d.ts" />\n';
			assert.strictEqual(actual, expected);
		});
	});

	describe('bulk', () => {
		var list = {
			'create-single': (bundle: Bundle) => {
				bundle.append('tango.d.ts');
			},
			'create-multi': (bundle: Bundle) => {
				bundle.append('tango.d.ts');
				bundle.append('victor.d.ts');
			},
			'noop-single': null,
			'noop-multi': null,
			'noop-footer': null,
			'noop-header': null,
			'noop-mixed': null,
			'append-single': (bundle: Bundle) => {
				bundle.append('tango.d.ts');
			},
			'append-multi': (bundle: Bundle) => {
				bundle.append('tango.d.ts');
				bundle.append('victor.d.ts');
			},
			'append-empty': (bundle: Bundle) => {
				bundle.append('tango.d.ts');
			},
			'remove-single': (bundle: Bundle) => {
				bundle.remove('tango.d.ts');
			},
			'remove-multi': (bundle: Bundle) => {
				bundle.remove('tango.d.ts');
				bundle.remove('victor.d.ts');
			}
		};

		Object.keys(list).forEach((name: string) => {
			it('"' + name + '"', () => {
				var value = list[name];
				var base = '';
				var src = path.join(fixtures, name, 'base.d.ts');
				var bundle = new Bundle(path.join(tmp, name, 'result.d.ts'));
				if (fs.existsSync(src)) {
					base = String(fileIO.readFileSync(src));
					bundle.parse(base);
				}
				var expected = fileIO.readFileSync(path.join(fixtures, name, 'result.d.ts'));

				if (typeOf.isFunction(value)) {
					// do it
					value.call(null, bundle, name);
				}
				var actual = bundle.stringify();

				fileIO.writeFileSync(bundle.target, actual);

				assert.strictEqual(actual, expected, name);
			});
		});
	});
});
