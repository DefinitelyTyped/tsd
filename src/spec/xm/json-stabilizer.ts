/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');
import path = require('path');

import chai = require('chai');
import assert = chai.assert;
import helper = require('../../test/helper');

import JSONStabilizer = require('../../xm/json/JSONStabilizer');

describe('JSONStabilizer', () => {
	'use strict';

	var fixtures = path.join(helper.getDirNameFixtures(), 'stabiliser');
	var tmp = path.join(helper.getDirNameTmp(), 'stabiliser');

	it('is constructor', () => {
		assert.isFunction(JSONStabilizer);
	});

	describe('bulk', () => {
		var list = {
			'simple-nice': {
				style: {
					eol: '\n',
					indent: '\t',
					trailingEOL: true
				},
				base: [
					'{\n',
					'\t"a": 1,\n',
					'\t"b": 2,\n',
					'\t"c": 3\n',
					'}\n'
				],
				expected: [
					'{\n',
					'\t"a": 1,\n',
					'\t"b": 2,\n',
					'\t"c": 3\n',
					'}\n'
				],
				func: (base, stable, name) => {
					return base;
				}
			},
			'simple-alt': {
				style: {
					eol: '\r\n',
					indent: '  ',
					trailingEOL: false
				},
				base: [
					'{\r\n',
					'  "a": 1,\r\n',
					'  "b": 2,\r\n',
					'  "c": 3\r\n',
					'}'
				],
				expected: [
					'{\r\n',
					'  "a": 1,\r\n',
					'  "b": 2,\r\n',
					'  "c": 3\r\n',
					'}'
				],
				func: (base, stable, name) => {
					return base;
				}
			},
			'correctify': {
				style: {
					eol: '\n',
					indent: '\t',
					trailingEOL: true
				},
				base: [
					'{\n',
					'\t"a"  : 1,\n',
					'  "b":2,\n',
					'\t"c": 3\r\n',
					'}\n'
				],
				expected: [
					'{\n',
					'\t"a": 1,\n',
					'\t"b": 2,\n',
					'\t"c": 3\n',
					'}\n'
				],
				func: (base, stable, name) => {
					return base;
				}
			},
			're-order': {
				snapshot: true,
				style: {
					eol: '\n',
					indent: '\t',
					trailingEOL: true
				},
				base: [
					'{\n',
					'\t"a": 1,\n',
					'\t"b": 2,\n',
					'\t"c": 3\n',
					'}\n'
				],
				expected: [
					'{\n',
					'\t"a": 11,\n',
					'\t"b": 12,\n',
					'\t"c": 13,\n',
					'\t"d": 14\n',
					'}\n'
				],
				func: (base, stable, name) => {
					return {
						b: 12,
						d: 14,
						c: 13,
						a: 11
					};
				}
			},
			'remove': {
				snapshot: true,
				style: {
					eol: '\n',
					indent: '\t',
					trailingEOL: true
				},
				base: [
					'{\n',
					'\t"a": 1,\n',
					'\t"b": 2,\n',
					'\t"c": 3\n',
					'}\n'
				],
				expected: [
					'{\n',
					'\t"a": 1,\n',
					'\t"c": 3\n',
					'}\n'
				],
				func: (base, stable, name) => {
					delete base.b;
					return base;
				}
			}
		};

		Object.keys(list).forEach((name: string) => {
			it('"' + name + '"', () => {
				var test = list[name];
				var stable = new JSONStabilizer(test.depth);

				var base = test.base.join('');
				var expected = test.expected.join('');

				stable.sniff(base);
				helper.assertObjectValues(stable.style, test.style);

				var object = JSON.parse(base);
				if (test.snapshot) {
					stable.snapshot(object);
				}
				var changed = test.func.call(null, object, stable, name);
				var actual = stable.toJSONString(changed);
				assert.strictEqual(actual, expected, name);
			});
		});
	});
});
