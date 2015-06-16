/// <reference path="./_ref.d.ts" />

'use strict';


import typeDetect = require('type-detect');
import encode = require('./encode');

interface Function {
	name:string;
}

export function getFuncLabel(func: any): string {
	var match: RegExpExecArray = /^\s?function ([^( ]*) *\( *([^(]*?) *\)/.exec(String(func));
	if (match && match.length >= 3) {
		return match[1] + '(' + match[2] + ')';
	}
	if (func.name) {
		return func.name;
	}
	return '<anonymous>';
}

export function toValueStrim(obj: any, depth: number = 4, cutoff: number = 80): string {
	var type = typeDetect(obj);

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
			return encode.trimWrap(obj, cutoff, true);
		case 'date' :
			return obj.toISOString();
		case 'function' :
			return getFuncLabel(obj);
		case 'arguments' :
		case 'array' :
		{
			if (depth <= 0) {
				return '<maximum recursion>';
			}
			// TODO optimise depth: doesn't loop over limit
			return '[' + encode.trim(obj.map((value) => {
				return encode.trim(value, depth);
			}).join(','), cutoff) + ']';
		}
		case 'object' :
		{
			if (depth <= 0) {
				return '<maximum recursion>';
			}
			// TODO optimise depth: doesn't loop over limit
			return encode.trim(String(obj) + ' {' + Object.keys(obj).sort().map((key) => {
				return encode.trim(key) + ':' + toValueStrim(obj[key], depth);
			}).join(','), cutoff) + '}';
		}
		default :
			throw (new Error('toValueStrim: cannot serialise type: ' + type));
	}
}
