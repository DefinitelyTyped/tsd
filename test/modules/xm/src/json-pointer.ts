/// <reference path='../../../globals.ts' />
/// <reference path='../../../globals.ts' />
/// <reference path='../../../../src/xm/file/file.ts' />

/// <reference path='../../../../src/xm/json/json-pointer.ts' />

describe('JSONPointer', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	it('is constructor', () => {
		assert.isFunction(xm.JSONPointer);
	});

	it('getValue', () => {
		var obj = {
			a: {
				bb: 22,
				cc: 33
			}
		};
		var pointer = new xm.JSONPointer(obj);

		assert.strictEqual(pointer.getValue('a/bb'), 22);
		assert.strictEqual(pointer.getValue('a/cc'), 33);

		assert.strictEqual(pointer.getValue('/a/bb'), 22);
		assert.strictEqual(pointer.getValue('/a/cc'), 33);

		assert.deepEqual(pointer.getValue('a'), {bb: 22, cc: 33});
		assert.deepEqual(pointer.getValue('/a'), {bb: 22, cc: 33});
	});

	it('setValue', () => {
		var obj = {
			a: {
				bb: 22,
				cc: 33
			}
		};
		var expected = {
			a: {
				bb: 99,
				cc: 33
			}
		};
		var pointer = new xm.JSONPointer(obj);

		pointer.setValue('a/bb', 99);

		assert.strictEqual(pointer.getValue('a/bb'), 99);
		assert.strictEqual(pointer.getValue('a/cc'), 33);
		assert.deepEqual(pointer.getValue('a'), {bb: 99, cc: 33});
		assert.deepEqual(obj, expected);
	});

	it('addSource', () => {
		var obj1 = {
			a: {
				bb: 22,
				cc: 33
			}
		};
		var obj2 = {
			a: {
				bb: 99
			},
			b: {
				zz: 44
			}
		};
		var pointer = new xm.JSONPointer(obj1);
		pointer.addSource(obj2);

		assert.strictEqual(pointer.getValue('a/bb'), 99);
		assert.strictEqual(pointer.getValue('a/cc'), 33);
		assert.strictEqual(pointer.getValue('b/zz'), 44);
	});
});
