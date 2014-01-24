/// <reference path="../../../globals.ts" />
/// <reference path="../../../../src/xm/object.ts" />

class ObjectUtilTestClass {
	private _propA:string = 'a';
	private _propB:string = 'b';
	propC:string = 'c';
	propD:string = 'd';
}

describe('xm.object', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	// TODO add tests for more methods
	describe('hidePrefixed()', () => {
		it('should return formatted string', () => {
			var keys;
			var inst = new ObjectUtilTestClass();

			keys = Object.keys(inst);
			assert.sameMembers(keys, ['_propA', '_propB', 'propC', 'propD'], 'before hide');

			xm.object.hidePrefixed(inst);

			keys = Object.keys(inst);
			assert.sameMembers(keys, ['propC', 'propD'], 'after hide');
		});
	});
	describe('lockProps()', () => {
		it('should throw when accessing frozen property', () => {
			var fixed = {aa: 1, bb: 2};

			fixed.aa = 10;
			fixed.bb = 20;
			assert.strictEqual(fixed.aa, 10, 'before fixed.aa');
			assert.strictEqual(fixed.bb, 20, 'before fixed.bb');

			xm.object.lockProps(fixed, ['aa']);

			assert.throws(() => {
				fixed.aa = 100;
			}, /^Cannot assign to read only property 'aa' of /);
			fixed.bb = 200;
			assert.strictEqual(fixed.aa, 10, 'after fixed.aa');
			assert.strictEqual(fixed.bb, 200, 'after fixed.bb');
		});
	});
});
