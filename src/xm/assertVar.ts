/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="typeOf.ts" />
///<reference path="inspect.ts" />

module xm {
	'use strict';

	var AssertionError = require('assertion-error');

	function isSha(value:any):boolean {
		if (typeof value !== 'string') {
			return false;
		}
		return /^[0-9a-f]{40}$/.test(value);
	}

	function isMd5(value:any):boolean {
		if (typeof value !== 'string') {
			return false;
		}
		return /^[0-9a-f]{32}$/.test(value);
	}

	var typeOfAssert:any = xm.getTypeOfMap({
		sha1: isSha,
		md5: isMd5
	});

	export function throwAssert(message:string, actual:any, expected:any, showDiff:boolean = true):void {
		message = message ? message + ': ' : '';
		message += 'values not equal';
		throw new AssertionError(message, {actual: actual, expected: expected, showDiff: showDiff});
	}

	/*
	 assertVar: assert a variable (like a function argument) and throw informative error on assertion failure
	 */
	//TODO expand validation options, add RegExp /string length (use extended xm.typeOf.ts)
	//TODO use extended xm.typeOf
	//TODO custom error?
	//TODO re-order arguments to comply with regular assertions
	export function assertVar(label:string, value:any, type:any, opt:boolean = false):void {
		if (arguments.length < 3) {
			throw new AssertionError('expected at least 3 arguments but got "' + arguments.length + '"');
		}
		var valueKind = xm.typeOf(value);
		var typeKind = xm.typeOf(type);

		var opts = [];
		var typeStrim = xm.toValueStrim(type);

		// undefined or null
		if (valueKind === 'undefined' || valueKind === 'null') {
			if (!opt) {
				throw new AssertionError('expected "' + label + '" to be defined as a ' + typeStrim + ' but got "' + value + '"');
			}
		}
		else if (typeKind === 'function') {
			if (!(value instanceof type)) {
				throw new AssertionError('expected "' + label + '" to be instanceof ' + typeStrim + ' but is a ' + xm.getFuncLabel(value.constructor) + ': ' + xm.toValueStrim(value));
			}
		}
		else if (typeKind === 'string') {
			if (xm.hasOwnProp(typeOfAssert, type)) {
				var check = typeOfAssert[type];
				if (!check(value)) {
					throw new AssertionError('expected "' + label + '" to be a ' + typeStrim + ' but got "' + valueKind + '": ' + xm.toValueStrim(value));
				}
			}
			else {
				throw new AssertionError('unknown type-assertion parameter ' + typeStrim + ' for "' + label + '"');
			}
		}
		else {
			throw new AssertionError('bad type-assertion parameter ' + typeStrim + ' for "' + label + '"');
		}
	}	//make a compact debug string from any object
}
