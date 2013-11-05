/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="typeOf.ts" />
///<reference path="encode.ts" />

interface Function {
	name:string;
}
module xm {
	'use strict';

	export function getFuncLabel(func):string {
		var match = /^\s?function ([^( ]*) *\( *([^(]*?) *\)/.exec(func);
		if (match && match.length >= 3) {
			return match[1] + '(' + match[2] + ')';
		}
		if (func.name) {
			return func.name;
		}
		return '<anonymous>';
	}

	export function toValueStrim(obj:any, depth:number = 4):string {
		var type = xm.typeOf(obj);

		var strCut = 40;
		var objCut = 50;

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
				return trimLine(obj, strCut);
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
				//TODO optimise deptp: doent loop over limit
				return '[' + trimLine(obj.map((value) => {
					return toValueStrim(value, depth);
				}).join(','), objCut, false) + ']';
			}
			case 'object' :
			{
				if (depth <= 0) {
					return '<maximum recursion>';
				}
				//TODO optimise deptp: doent loop over limit
				return trimLine(String(obj) + ' {' + Object.keys(obj).sort().map((key) => {
					return trimLine(key) + ':' + toValueStrim(obj[key], depth);
				}).join(','), objCut, false) + '}';
			}
			default :
				throw (new Error('toValueStrim: cannot serialise type: ' + type));
		}
	}

	export function trimLine(value:string, cutoff:number = 30, wrapQuotes:boolean = true):string {
		if (value.length > cutoff - 2) {
			value = value.substr(0, cutoff - 5) + '...';
		}
		return xm.wrapIfComplex(value, {quotes: wrapQuotes});
	}
}
