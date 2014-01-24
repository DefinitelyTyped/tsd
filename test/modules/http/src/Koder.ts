/// <reference path="../../../globals.ts" />
/// <reference path="../../../helper.ts" />
/// <reference path="../../../../src/xm/iterate.ts" />
/// <reference path="../../../../src/xm/assertVar.ts" />
/// <reference path="../../../../src/xm/Koder.ts" />

describe('koders', () => {

	var assert:Chai.Assert = require('chai').assert;
	var path = require('path');

	describe('StringKoder', () => {
		var str = 'hello';
		var buffer:NodeBuffer = new Buffer('hello', 'utf8');

		it.eventually('should encode', () => {
			return xm.StringKoder.utf8.encode(str).then((encoded:NodeBuffer) => {
				assert.strictEqual(encoded.toString('utf8'), str);
				helper.assertBufferEqual(encoded, buffer);
			});
		});
		it.eventually('should decode', () => {
			return xm.StringKoder.utf8.decode(buffer).then((actual:string) => {
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
		var objBuffer:NodeBuffer = new Buffer(JSON.stringify(objs), 'utf8');
		var numBuffer:NodeBuffer = new Buffer(JSON.stringify(nums), 'utf8');
		var objectCoder = new xm.JSONKoder({type: 'array', items: {type: 'object'}});

		describe('main', () => {
			it.eventually('should decode', () => {
				return xm.JSONKoder.main.decode(objBuffer).then((actual:any) => {
					assert.deepEqual(actual, objs);
				});
			});
			it.eventually('should encode/decode', () => {
				return xm.JSONKoder.main.encode(objs).then((encoded:NodeBuffer) => {
					assert.deepEqual(JSON.parse(encoded.toString('utf8')), objs, 'valid');

					return xm.JSONKoder.main.decode(encoded).then((actual:any) => {
						assert.deepEqual(actual, objs, 'valid');
					});
				});
			});
		});

		describe('with schema', () => {
			it.eventually('should decode', () => {
				return objectCoder.decode(objBuffer).then((actual:any) => {
					assert.deepEqual(actual, objs);
				});
			});
			it.eventually('should encode/decode', () => {
				return objectCoder.encode(objs).then((encoded:NodeBuffer) => {
					assert.deepEqual(JSON.parse(encoded.toString('utf8')), objs, 'valid');

					return objectCoder.decode(encoded).then((actual:any) => {
						assert.deepEqual(actual, objs, 'valid');
					});
				});
			});
			it.eventually('should not decode invalid schema', () => {
				return objectCoder.decode(numBuffer).then((actual:any) => {
					assert(false, 'shall not pass');
				}, (err) => {
					// ignore
				});
			});
			it.eventually('should not encode invalid schema', () => {
				return objectCoder.encode(nums).then((actual:any) => {
					assert(false, 'shall not pass');
				}, (err) => {
					// ignore
				});
			});
		});
	});
});
