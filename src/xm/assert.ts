/// <reference path="./_ref.d.ts" />

'use strict';

import AssertionError = require('assertion-error');

import typeOf = require('./typeOf');
import inspect = require('./inspect');
import encode = require('./encode');

var typeOfAssert = typeOf.getTypeOfMap();

// TODO test assert()
function assert(pass: boolean, message: string, actual?: any, expected?: any, showDiff: boolean = true, ssf?: any): void {
	if (!!pass) {
		return;
	}
	if (typeOf.isString(message)) {
		message = message.replace(/\{([\w]+)\}/gi, function(match, id) {
			switch (id) {
				case 'a':
				case 'act':
				case 'actual':
					if (arguments.length > 2) {
						return inspect.toValueStrim(actual);
					}
					break;
				case 'e':
				case 'exp':
				case 'expected':
					if (arguments.length > 3) {
						return inspect.toValueStrim(expected);
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

export = assert;
