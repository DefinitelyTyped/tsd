/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="typeOf.ts" />
/// <reference path="encode.ts" />

interface Function {
	name:string;
}
module xm {
	'use strict';

	export function getFuncLabel(func:any):string {
		var match:RegExpExecArray = /^\s?function ([^( ]*) *\( *([^(]*?) *\)/.exec(String(func));
		if (match && match.length >= 3) {
			return match[1] + '(' + match[2] + ')';
		}
		if (func.name) {
			return func.name;
		}
		return '<anonymous>';
	}

	export function toValueStrim(obj:any, depth:number = 4, cutoff:number = 80):string {
		var type = xm.typeOf(obj);

		depth--;

		switch (type) {
			case 'boolean' :
			case 'regexp' :
				return obj.toString();
			case 'null' :
			case 'undefined' :
				return type;
			case 'number' :
				return obj.toString(10);
			case 'string' :
				return trimWrap(obj, cutoff, true);
			case 'date' :
				return obj.toISOString();
			case 'function' :
				return xm.getFuncLabel(obj);
			case 'arguments' :
			case 'array' :
			{
				if (depth <= 0) {
					return '<maximum recursion>';
				}
				// TODO optimise depth: doesn't loop over limit
				return '[' + trim(obj.map((value) => {
					return trim(value, depth);
				}).join(','), cutoff) + ']';
			}
			case 'object' :
			{
				if (depth <= 0) {
					return '<maximum recursion>';
				}
				// TODO optimise depth: doesn't loop over limit
				return trim(String(obj) + ' {' + Object.keys(obj).sort().map((key) => {
					return trim(key) + ':' + toValueStrim(obj[key], depth);
				}).join(','), cutoff) + '}';
			}
			default :
				throw (new Error('toValueStrim: cannot serialise type: ' + type));
		}
	}
}
