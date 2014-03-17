/// <reference path="../../_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;
import helper = require('../../test/helper');

import typeOf = require('../../xm/typeOf');

describe('typeOf', () => {

	var func = function () {
		// dummy
	};

	var data = (function () {
		return {
			arguments: [typeOf.isArguments, arguments],
			array: [typeOf.isArray, []],
			date: [typeOf.isDate, new Date()],
			function: [typeOf.isFunction, func],
			number: [typeOf.isNumber, 123],
			regexp: [typeOf.isRegExp, /abc/],
			string: [typeOf.isString, 'abc'],
			null: [typeOf.isNull, null],
			undefined: [typeOf.isUndefined, undefined],
			object: [typeOf.isObject, {}],
			boolean: [typeOf.isBoolean, true]
		};
	})();

	describe('typeOf.get()', () => {
		for (var mainType in data) {
			if (data.hasOwnProperty(mainType)) {

				it(mainType, () => {
					for (var checkType in data) {
						if (data.hasOwnProperty(checkType)) {
							var checkData = data[checkType];
							if (checkType === mainType) {
								assert.strictEqual(typeOf.get(checkData[1]), mainType);
							}
							else {
								assert.notStrictEqual(typeOf.get(checkData[1]), mainType);
							}
						}
					}
				});
			}
		}
	});

	describe('is<type>()', () => {
		for (var mainType in data) {
			if (data.hasOwnProperty(mainType)) {
				var mainData = data[mainType];

				it(mainType, () => {
					var func = mainData[0];
					for (var checkType in data) {
						if (data.hasOwnProperty(checkType)) {
							var checkData = data[checkType];
							if (checkType === mainType) {
								assert.isTrue(func(checkData[1]), 'testing ' + checkType);
							}
							else {
								assert.isFalse(func(checkData[1]), 'testing ' + checkType);
							}
						}
					}
				});
			}
		}
	});

	describe('isType() by name', () => {
		for (var mainType in data) {
			if (data.hasOwnProperty(mainType)) {

				it(mainType, () => {
					for (var checkType in data) {
						if (data.hasOwnProperty(checkType)) {
							var checkData = data[checkType];
							if (checkType === mainType) {
								assert.isTrue(typeOf.isType(checkData[1], mainType), 'testing ' + checkType);
							}
							else {
								assert.isFalse(typeOf.isType(checkData[1], mainType), 'testing ' + checkType);
							}
						}
					}
				});
			}
		}
	});

	describe('isValid() by name', () => {
		it('isValid', () => {
			assert.isTrue(typeOf.isValid(1), 'number');
			assert.isTrue(typeOf.isValid(true), 'boolean');
			assert.isTrue(typeOf.isValid({}), 'object');
			assert.isTrue(typeOf.isValid(0), '0');
			assert.isTrue(typeOf.isValid(false), 'false');
		});

		it('not isValid', () => {
			assert.isFalse(typeOf.isValid(undefined), 'undefined');
			assert.isFalse(typeOf.isValid(null), 'null');
			assert.isFalse(typeOf.isValid(parseFloat('nope')), 'parseFloat: NaN');
		});
	});
});
