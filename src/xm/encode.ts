/// <reference path="./_ref.d.ts" />

// FIXME figure out what is actually used at all and cleanup this nightmare (seriously wtf)

// evill

'use strict';

import util = require('util');
import jsesc = require('jsesc');

import typeOf = require('./typeOf');

var stringExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
var stringQuote = '"';

var identExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
var identAnyExp = /^[a-z0-9](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
var intExp = /^\d+$/;

var escapeRep = '\\$&';
var escapeAdd = '\\$&$&';

export var singleQuoteExp = /([^'\\]*(?:\\.[^'\\]*)*)'/g;
export var doubleQuoteExp = /([^"\\]*(?:\\.[^"\\]*)*)"/g;

// very handy for Array.map
export interface IReplacer {
	(input: string):string;
}

export function getEscaper(vars: any): IReplacer {
	var values = (typeOf.isString(vars.values) ? vars.values.split('') : vars.values);
	var matches = (typeOf.isString(vars.matches) ? vars.matches.split('') : vars.matches);
	var replacer = function (match: string, ...args: any[]) {
		var i = matches.indexOf(match);
		if (i > -1 && i < values.length) {
			return '\\' + values[i];
		}
		return match;
	};

	var exp = new RegExp('[' + values.map((char: string) => {
		return '\\' + char;
	}).join('') + ']', 'g');

	return function (input: string): string {
		return input.replace(exp, replacer);
	};
}

export function getMultiReplacer(vars: any): IReplacer {
	var values = vars.values;
	var matches = vars.matches;
	var replacer = function (match: string, ...args: any[]) {
		var i = matches.indexOf(match);
		if (i > -1 && i < values.length) {
			return values[i];
		}
		return match;
	};

	var exp = new RegExp(vars.exps.map((char: string) => {
		return '(?:' + char + ')';
	}).join('|'), 'g');

	return function (input: string): string {
		return input.replace(exp, replacer);
	};
}

export var unprintCC: IReplacer = getEscaper({
	matches: '\b\f\n\r\t\v\0',
	values: 'bfnrtv0'
});
export var unprintNL: IReplacer = getEscaper({
	matches: '\r\n',
	values: 'rn'
});
export var unprintNotNL: IReplacer = getEscaper({
	matches: '\b\f\t\v\0',
	values: 'bftv0'
});
export var unprintNLS: IReplacer = getMultiReplacer({
	exps: ['\\r\\n', '\\n', '\\r'],
	matches: ['\r\n', '\n', '\r'],
	values: ['\\r\\n\r\n', '\\n\n', '\\r\r']
});

export function quoteSingle(input: string): string {
	return input.replace(singleQuoteExp, '$1\\\'');
}

export function quoteDouble(input: string): string {
	return input.replace(doubleQuoteExp, '$1\\"');
}

export function quoteSingleWrap(input: string): string {
	return '\'' + input.replace(singleQuoteExp, '$1\\\'') + '\'';
}

export function quoteDoubleWrap(input: string): string {
	return '"' + input.replace(doubleQuoteExp, '$1\\"') + '"';
}

export function escapeControl(input: string, reAddNewlines: boolean = false): string {
	input = String(input);
	if (reAddNewlines) {
		return unprintNLS(unprintNotNL(input));
	}
	return unprintCC(input);
}

export function wrapQuotes(input: string, double?: boolean): string {
	input = escapeControl(input);
	if (double) {
		return quoteDoubleWrap(input);
	}
	return quoteSingleWrap(input);
}

export function wrapIfComplex(input: string, double?: boolean): string {
	input = String(input);
	if (!identAnyExp.test(input)) {
		return wrapQuotes(unprintCC(input), double);
	}
	return input;
}

export function trim(value: string, cutoff: number = 60): string {
	if (cutoff && value.length > cutoff) {
		return value.substr(0, cutoff) + '...';
	}
	return value;
}

export function trimWrap(value: string, cutoff: number = 60, double?: boolean): string {
	value = String(value);
	if (cutoff && value.length > cutoff) {
		return wrapQuotes(value.substr(0, cutoff), double) + '...';
	}
	return wrapQuotes(value, double);
}
