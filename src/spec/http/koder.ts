/// <reference path="../../_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;
import helper = require('../../test/helper');

import koder = require('../../xm/lib/koder');
import StringKoder = koder.StringKoder;
import JSONKoder = koder.JSONKoder;

'use strict';

describe('koders', () => {
	describe('StringKoder', () => {
		var str = 'hello';
		var buffer: NodeBuffer = new Buffer('hello', 'utf8');

		it('should encode', () => {
			return StringKoder.utf8.encode(str).then((encoded: NodeBuffer) => {
				assert.strictEqual(encoded.toString('utf8'), str);
				helper.assertBufferEqual(encoded, buffer);
			});
		});
		it('should decode', () => {
			return StringKoder.utf8.decode(buffer).then((actual: string) => {
				assert.strictEqual(actual, str);
			});
		});
	});

	describe('JSONKoder', () => {

		var objs = [
			{yo: 123},
			{oi: 321},
		];
		var nums = [1, 2, 3];
		var objBuffer = new Buffer(JSON.stringify(objs), 'utf8');
		var numBuffer = new Buffer(JSON.stringify(nums), 'utf8');
		var objectCoder = new JSONKoder({type: 'array', items: {type: 'object'}});

		describe('main', () => {
			it('should decode', () => {
				return JSONKoder.main.decode(objBuffer).then((actual: any) => {
					assert.deepEqual(actual, objs);
				});
			});
			it('should encode/decode', () => {
				return JSONKoder.main.encode(objs).then((encoded: NodeBuffer) => {
					assert.deepEqual(JSON.parse(encoded.toString('utf8')), objs, 'valid');

					return JSONKoder.main.decode(encoded).then((actual: any) => {
						assert.deepEqual(actual, objs, 'valid');
					});
				});
			});
		});

		describe('with schema', () => {
			it('should decode', () => {
				return objectCoder.decode(objBuffer).then((actual: any) => {
					assert.deepEqual(actual, objs);
				});
			});
			it('should encode/decode', () => {
				return objectCoder.encode(objs).then((encoded: NodeBuffer) => {
					assert.deepEqual(JSON.parse(encoded.toString('utf8')), objs, 'valid');

					return objectCoder.decode(encoded).then((actual: any) => {
						assert.deepEqual(actual, objs, 'valid');
					});
				});
			});
			it('should not decode invalid schema', () => {
				return objectCoder.decode(numBuffer).then((actual: any) => {
					assert(false, 'shall not pass');
				}, (err) => {
					// ignore
				});
			});
			it('should not encode invalid schema', () => {
				return objectCoder.encode(nums).then((actual: any) => {
					assert(false, 'shall not pass');
				}, (err) => {
					// ignore
				});
			});
		});
	});
});
