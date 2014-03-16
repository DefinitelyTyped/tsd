/// <reference path="./_ref.d.ts" />

import AssertionError = require('assertion-error');

import typeOf = require('./typeOf');
import inspect = require('./inspect');
import encode = require('./encode');

var typeOfAssert = typeOf.getTypeOfMap();
/*
 assertVar: assert a variable (like a function argument) and throw informative error on assertion failure
 */
// TODO expand validation options, add RegExp /string length
// TODO use extended typeOf (more types and meta types)
function assertVar(value: any, type: any, label: string, opt: boolean = false): void {
	if (arguments.length < 3) {
		throw new AssertionError('expected at least 3 arguments but got "' + arguments.length + '"');
	}
	var valueKind = typeOf.get(value);
	var typeKind = typeOf.get(type);

	// undefined or null or NaN
	if (!typeOf.isValid(value)) {
		if (!opt) {
			throw new AssertionError(
			'expected ' + encode.wrapQuotes(label, true)
			+ ' to be defined as a ' + inspect.toValueStrim(type)
			+ ' but got ' + (valueKind === 'number' ? 'NaN' : valueKind),
			undefined, assertVar
			);
		}
	}
	else if (typeKind === 'function') {
		if (!(value instanceof type)) {
			throw new AssertionError(
			'expected ' + encode.wrapQuotes(label, true)
			+ ' to be instanceof ' + inspect.getFuncLabel(type)
			+ ' but is a ' + inspect.getFuncLabel(value.constructor)
			+ ': ' + inspect.toValueStrim(value),
			undefined, assertVar
			);
		}
	}
	else if (typeKind === 'string') {
		if (typeOf.hasOwnProp(typeOfAssert, type)) {
			var check = typeOfAssert[type];
			if (!check(value)) {
				throw new AssertionError(
				'expected ' + encode.wrapQuotes(label, true)
				+ ' to be a ' + encode.wrapQuotes(type, true)
				+ ' but got a ' + encode.wrapQuotes(valueKind, true)
				+ ': ' + inspect.toValueStrim(value),
				undefined, assertVar
				);
			}
		}
		else {
			throw new AssertionError(
			'unknown type-assertion parameter ' + encode.wrapQuotes(type, true)
			+ ' for ' + inspect.toValueStrim(value),
			undefined, assertVar
			);
		}
	}
	else {
		throw new AssertionError(
		'bad type-assertion parameter '
		+ inspect.toValueStrim(type)
		+ ' for '
		+ encode.wrapQuotes(label, true),
		undefined, assertVar
		);
	}
}

export = assertVar;
