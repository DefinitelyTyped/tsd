/// <reference path="../../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;
import helper = require('../../test/helper');

import assertVar = require('../../xm/assertVar');
import assertX = require('../../xm/assert');

describe('assertVar', () => {
	describe('optional', () => {
		it('should pass null/undefined on optional', () => {
			assertVar(undefined, 'string', 'myVar', true);
			assertVar(null, 'string', 'myVar', true);
		});
	});
	describe('undefined', () => {
		it('should throw on undefined', () => {
			helper.assertError(() => {
				assertVar(undefined, 'string', 'myVar');
			}, 'expected "myVar" to be defined as a "string" but got undefined');
		});
		it('should throw on null', () => {
			helper.assertError(() => {
				assertVar(null, 'string', 'myVar');
			}, 'expected "myVar" to be defined as a "string" but got null');
		});
		it('should throw on NaN', () => {
			helper.assertError(() => {
				assertVar(NaN, 'string', 'myVar');
			}, 'expected "myVar" to be defined as a "string" but got NaN');
		});
	});
	describe('string', () => {
		it('should pass on valid', () => {
			assertVar('aaa', 'string', 'myVar');
			assertVar('', 'string', 'myVar');
		});
		it('should fail on invalid', () => {
			helper.assertError(() => {
				assertVar(123, 'string', 'myVar');
			}, 'expected "myVar" to be a "string" but got a "number": 123');
		});
	});
	describe('number', () => {
		it('should pass on valid', () => {
			assertVar(123, 'number', 'myVar');
		});
		it('should fail on invalid', () => {
			helper.assertError(() => {
				assertVar('abc', 'number', 'myVar');
			}, 'expected "myVar" to be a "number" but got a "string": "abc"');
		});
	});
	describe('regexp', () => {
		it('should pass on valid', () => {
			assertVar(/123/, 'regexp', 'myVar');
		});
		it('should fail on invalid', () => {
			helper.assertError(() => {
				assertVar(123, 'regexp', 'myVar');
			}, 'expected "myVar" to be a "regexp" but got a "number": 123');
		});
	});
	describe('sha1', () => {
		it('should pass on valid', () => {
			assertVar('7ef3f65b1be3699db091aaec81ab0b205919a6d0', 'sha1', 'myVar');
		});
		it('should fail on invalid', () => {
			helper.assertError(() => {
				assertVar('abc', 'sha1', 'myVar');
			}, 'expected "myVar" to be a "sha1" but got a "string": "abc"');
		});
	});
	describe('md5', () => {
		it('should pass on valid', () => {
			assertVar('80b28dda155a27c42cabd42381dc7670', 'md5', 'myVar');
		});
		it('should fail on invalid', () => {
			helper.assertError(() => {
				assertVar('abc', 'md5', 'myVar');
			}, 'expected "myVar" to be a "md5" but got a "string": "abc"');
		});
	});
	describe('instanceOf', () => {

		function MyType() {
			this.prop = 123;
		}

		function MyOtherType() {
			this.otherProp = 321;
		}

		it('should pass on valid', () => {
			var inst = new MyType();
			assertVar(inst, MyType, 'myVar');
		});

		it('should fail on invalid', () => {
			var inst = new MyType();
			assert.throws(() => {
				assertVar(inst, MyOtherType, 'myVar');
			}, /^expected "myVar" to be instanceof MyOtherType\(\) but is a MyType\(\)/);
		});
	});
	describe('assert()', () => {
		it('should replace vars', () => {
			helper.assertError(() => {
				assertX(false, 'message: {act}, {exp}', 'abc', 'def');
			}, 'message: "abc", "def"');
		});
	});
});
