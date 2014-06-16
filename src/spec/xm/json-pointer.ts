/// <reference path="../../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;
import helper = require('../../test/helper');

import JSONPointer = require('../../xm/json/JSONPointer');

describe('JSONPointer', () => {
	it('is constructor', () => {
		assert.isFunction(JSONPointer);
	});

	it('getValue', () => {
		var obj = {
			a: {
				bb: 22,
				cc: 33
			}
		};
		var pointer = new JSONPointer(obj);

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
		var pointer = new JSONPointer(obj);

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
		var pointer = new JSONPointer(obj1);
		pointer.addSource(obj2);

		assert.strictEqual(pointer.getValue('a/bb'), 99);
		assert.strictEqual(pointer.getValue('a/cc'), 33);
		assert.strictEqual(pointer.getValue('b/zz'), 44);
	});
});
