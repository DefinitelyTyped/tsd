/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="typeOf.ts" />
/// <reference path="inspect.ts" />

module xm {
	'use strict';

	var AssertionError = require('assertion-error');

	export function isSha(value:any):boolean {
		if (typeof value !== 'string') {
			return false;
		}
		return /^[0-9a-f]{40}$/.test(value);
	}

	export function isShaShort(value:any):boolean {
		if (typeof value !== 'string') {
			return false;
		}
		return /^[0-9a-f]{6,40}$/.test(value);
	}

	export function isMd5(value:any):boolean {
		if (typeof value !== 'string') {
			return false;
		}
		return /^[0-9a-f]{32}$/.test(value);
	}

	var typeOfAssert:any = xm.getTypeOfMap({
		sha1: isSha,
		sha1Short: isShaShort,
		md5: isMd5
	});

	//TODO test xm.assert()
	export function assert(pass:boolean, message:string, actual?:any, expected?:any, showDiff:boolean = true, ssf?:any):void {
		if (!!pass) {
			return;
		}
		if (xm.isString(message)) {
			message = message.replace(/\{([\w]+)\}/gi, (match, id) => {
				switch (id) {
					case 'a':
					case 'act':
					case 'actual':
						if (arguments.length > 2) {
							return xm.toValueStrim(actual);
						}
						break;
					case 'e':
					case 'exp':
					case 'expected':
						if (arguments.length > 3) {
							return xm.toValueStrim(expected);
						}
						break;
					default:
						return match;
				}
			});
		}
		else {
			message = '';
		}
		throw new AssertionError(message, {actual: actual, expected: expected, showDiff: showDiff}, ssf);
	}

	export function throwAssert(message:string, actual?:any, expected?:any, showDiff:boolean = true, ssf?:any):void {
		xm.assert(false, message, actual, expected, showDiff, ssf);
	}

	/*
	 assertVar: assert a variable (like a function argument) and throw informative error on assertion failure
	 */
	//TODO expand validation options, add RegExp /string length (use extended xm.typeOf.ts)
	//TODO use extended xm.typeOf (more types and meta types)
	//TODO clean line-length insanity
	export function assertVar(value:any, type:any, label:string, opt:boolean = false):void {
		if (arguments.length < 3) {
			throw new AssertionError('expected at least 3 arguments but got "' + arguments.length + '"');
		}
		var valueKind = xm.typeOf(value);
		var typeKind = xm.typeOf(type);

		// undefined or null or NaN
		if (!xm.isValid(value)) {
			if (!opt) {
				throw new AssertionError(
					'expected ' + xm.wrapQuotes(label, true)
						+ ' to be defined as a ' + xm.toValueStrim(type)
						+ ' but got ' + (valueKind === 'number' ? 'NaN' : valueKind)
				);
			}
		}
		else if (typeKind === 'function') {
			if (!(value instanceof type)) {
				throw new AssertionError(
					'expected ' + xm.wrapQuotes(label, true)
						+ ' to be instanceof ' + xm.getFuncLabel(type)
						+ ' but is a ' + xm.getFuncLabel(value.constructor)
						+ ': ' + xm.toValueStrim(value))
					;
			}
		}
		else if (typeKind === 'string') {
			if (xm.hasOwnProp(typeOfAssert, type)) {
				var check = typeOfAssert[type];
				if (!check(value)) {
					throw new AssertionError(
						'expected ' + xm.wrapQuotes(label, true)
							+ ' to be a ' + xm.wrapQuotes(type, true)
							+ ' but got a ' + xm.wrapQuotes(valueKind, true)
							+ ': ' + xm.toValueStrim(value)
					);
				}
			}
			else {
				throw new AssertionError(
					'unknown type-assertion parameter ' + xm.wrapQuotes(type, true)
						+ ' for ' + xm.toValueStrim(value) + ''
				);
			}
		}
		else {
			throw new AssertionError(
				'bad type-assertion parameter '
					+ xm.toValueStrim(type) + ' for '
					+ xm.wrapQuotes(label, true) + ''
			);
		}
	}
}
