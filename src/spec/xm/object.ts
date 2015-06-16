/// <reference path="../../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;
import helper = require('../../test/helper');

import objectUtils = require('../../xm/objectUtils');

class ObjectUtilTestClass {
	private _propA: string = 'a';
	private _propB: string = 'b';
	propC: string = 'c';
	propD: string = 'd';
}

describe('object', () => {
	describe('lockProps()', () => {
		it('should throw when accessing frozen property', () => {
			var fixed = {aa: 1, bb: 2};

			fixed.aa = 10;
			fixed.bb = 20;
			assert.strictEqual(fixed.aa, 10, 'before fixed.aa');
			assert.strictEqual(fixed.bb, 20, 'before fixed.bb');

			objectUtils.lockProps(fixed, ['aa']);

			assert.throws(() => {
				fixed.aa = 100;
			}, /^Cannot assign to read only property 'aa' of /);
			fixed.bb = 200;
			assert.strictEqual(fixed.aa, 10, 'after fixed.aa');
			assert.strictEqual(fixed.bb, 200, 'after fixed.bb');
		});
	});
});
