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

	//TODO test xm.assert()
	export function assert(pass:boolean, message:string, actual:any, expected:any, showDiff:boolean = true, ssf?:any):void {
		if (pass) {
			return;
		}
		if (message) {
			message.replace(/\{([\w+])\}/g, (match, id) => {
				switch (id) {
					case 'act':
						return xm.toValueStrim(actual);
					case 'exp':
						return xm.toValueStrim(expected);
					default:
						return '{' + id + '}';
				}
			});
			message += ': ';
		}
		else {
			message = '';
		}
		throw new AssertionError(message, {actual: actual, expected: expected, showDiff: showDiff}, ssf);
	}

	export function throwAssert(message:string, actual:any, expected:any, showDiff:boolean = true, ssf?:any):void {
		message = message ? message + ': ' : '';
		throw new AssertionError(message, {actual: actual, expected: expected, showDiff: showDiff}, ssf);
	}

	/*
	 assertVar: assert a variable (like a function argument) and throw informative error on assertion failure
	 */
	//TODO expand validation options, add RegExp /string length (use extended xm.typeOf.ts)
	//TODO use extended xm.typeOf (more types)
	export function assertVar(value:any, type:any, label:string, opt:boolean = false):void {
		if (arguments.length < 3) {
			throw new AssertionError('expected at least 3 arguments but got "' + arguments.length + '"');
		}
		var valueKind = xm.typeOf(value);
		var typeKind = xm.typeOf(type);

		// undefined or null
		if (valueKind === 'undefined' || valueKind === 'null') {
			if (!opt) {
				throw new AssertionError('expected "' + label + '" to be defined as a ' + xm.toValueStrim(type) + ' but got "' + value + '"');
			}
		}
		else if (typeKind === 'function') {
			if (!(value instanceof type)) {
				throw new AssertionError('expected "' + label + '" to be instanceof ' + xm.toValueStrim(type) + ' but is a ' + xm.getFuncLabel(value.constructor) + ': ' + xm.toValueStrim(value));
			}
		}
		else if (typeKind === 'string') {
			if (xm.hasOwnProp(typeOfAssert, type)) {
				var check = typeOfAssert[type];
				if (!check(value)) {
					throw new AssertionError('expected "' + label + '" to be a ' + xm.toValueStrim(type) + ' but got "' + valueKind + '": ' + xm.toValueStrim(value));
				}
			}
			else {
				throw new AssertionError('unknown type-assertion parameter ' + xm.toValueStrim(type) + ' for "' + label + '"');
			}
		}
		else {
			throw new AssertionError('bad type-assertion parameter ' + xm.toValueStrim(type) + ' for "' + label + '"');
		}
	}	//make a compact debug string from any object
}
