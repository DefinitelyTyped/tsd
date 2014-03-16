/// <reference path="../_ref.d.ts" />

import fs = require('fs');
import path = require('path');
import util = require('util');

import Promise = require('bluebird');
import chai = require('chai');
import assert = chai.assert;
import childProcess = require('child_process');
import bufferEqual = require('buffer-equal');

import typeOf = require('../../src/xm/typeOf');
import PackageJSON = require('../../src/xm/data/PackageJSON');

var shaRegExp = /^[0-9a-f]{40}$/;
var md5RegExp = /^[0-9a-f]{32}$/;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function getProjectRoot():string {
	return path.dirname(PackageJSON.find());
}

export function getDirNameFixtures():string {
	return path.resolve(__dirname, '..', 'fixtures');
}

export function getDirNameTmp():string {
	return path.resolve(__dirname, '..', 'tmp');
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// helper to get a readable debug message (useful when comparing things absed on 2 paths)
// can be improved freely (as required as it is for visualisation only)
export function getPathMessage(pathA:string, pathB:string, message:string):string {
	// make absolute
	pathA = path.resolve(pathA);
	pathB = path.resolve(pathB);
	var elemsA = pathA.split(path.sep);
	var elemsB = pathB.split(path.sep);

	// remove identical parts
	while (elemsA.length > 0 && elemsB.length > 0 && elemsA[0] === elemsB[0]) {
		elemsA.shift();
		elemsB.shift();
	}

	// same paths?
	if (elemsA.length === 0 && elemsA.length === elemsB.length) {
		return message + ': \'' + path.basename(pathA) + '\'';
	}

	// different, print remains
	return message + ': ' + '\'' + elemsA.join(path.sep) + '\' vs \'' + elemsB.join(path.sep) + '\'';
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function longAssert(actual:string, expected:string, msg?:string):void {
	if (actual !== expected) {
		throw new chai.AssertionError((msg ? msg + ': ' : '') + 'long string', {
			actual: actual,
			expected: expected
		}, helper.longAssert);
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function dump(object:any, message?:string, depth:number = 6, showHidden:boolean = false):any {
	message = typeOf.isUndefined(message) ? '' : message + ': ';
	xm.log(message + util.inspect(object, showHidden, depth, true));
}

export function dumpJSON(object:any, message?:string):any {
	message = typeOf.isUndefined(message) ? '' : message + ': ';
	xm.log(message + JSON.stringify(object, null, 4));
}

export function assertFormatSHA1(value:string, msg?:string):void {
	assert.isString(value, msg);
	assert.match(value, shaRegExp, msg);
}

export function assertFormatMD5(value:string, msg?:string):void {
	assert.isString(value, msg);
	assert.match(value, md5RegExp, msg);
}

export function propStrictEqual(actual:Object, expected:Object, prop:string, message:string):void {
	assert.property(actual, prop, message + '.' + prop + ' actual');
	assert.property(expected, prop, message + '.' + prop + ' expected');
	assert.strictEqual(actual[prop], expected[prop], message + '.' + prop + ' equal');
}

export function assertBufferEqual(act:NodeBuffer, exp:NodeBuffer, msg?:string):void {
	assert.instanceOf(act, Buffer, msg + ': ' + act);
	assert.instanceOf(exp, Buffer, msg + ': ' + exp);
	assert(bufferEqual(act, exp), msg + ': bufferEqual');
}

export function assertBufferUTFEqual(act:NodeBuffer, exp:NodeBuffer, msg?:string):void {
	assert.instanceOf(act, Buffer, msg + ': ' + act);
	assert.instanceOf(exp, Buffer, msg + ': ' + exp);
	assert.strictEqual(act.toString('utf8'), exp.toString('utf8'), msg + ': bufferEqual');
}

export function assertObjectValues(actual:Object, expected:Object, msg?:string):void {
	assert.isObject(actual, msg + ': actual');
	assert.isObject(expected, msg + ': expected');
	var test:any = {};
	Object.keys(expected).forEach((prop:string) => {
		if (typeof actual[prop] !== 'undefined') {
			test[prop] = actual[prop];
		}
		else {
			test[prop] = 0;
		}
	});
	assert.deepEqual(test, expected, msg);
}

export function assertNotes(actual:Object[], expected:Object[], msg:string):void {
	assert.isArray(actual, msg + ': actual');
	assert.isArray(expected, msg + ': expected');

	actual = actual.slice(0);
	expected = expected.slice(0);

	var next:any;
	while (expected.length > 0) {
		next = expected.shift();

		while (actual.length > 0) {
			var act:any = actual.shift();
			var codeOK = (typeof next.code !== 'undefined') && (next.code === act.code);
			var messageOK = (typeof next.message !== 'undefined') && (next.message.test(act.message));
			if (codeOK && messageOK) {
				next = null;
				break;
			}
		}
		if (actual.length === 0) {
			break;
		}
	}

	// report
	if (next) {
		expected.unshift(next);
	}
	if (expected.length > 0) {
		expected.forEach((item:any) => {
			item.message = String(item.message);
		});
		actual.forEach((item:any) => {
			item.message = String(item.message);
		});
		assert.fail(actual, expected, 'expected more notes');
	}
}

// hackish to get more ingot then assert.throws()
export function assertError(exec:() => void, expected:any, msg?:string):void {
	msg = (msg ? msg + ': ' : '');
	try {
		exec();
	}
	catch (e) {
		var errorMsg:any = e.message.toString().match(/.*/m);
		if (errorMsg) {
			errorMsg = errorMsg[0];
			if (typeOf.isRegExp(expected)) {
				if (!expected.test(errorMsg)) {
					assert.strictEqual(errorMsg, '', msg + 'expected to match RegExp: ' + expected);
				}
			}
			else {
				assert.strictEqual(errorMsg, expected, msg + 'match message');
			}
			return;
		}
	}
	assert.strictEqual('', expected.toString(), msg + 'expected to throw and match ' + expected);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// for safety
function promiseDoneMistake():void {
	throw new Error('don\'t use a done() callback when using it.eventually()');
}

// monkey patch
it.eventually = function eventually(expectation:string, assertion?:(call:() => void) => void):void {
	it(expectation, (done) => {
		Q(assertion(promiseDoneMistake)).done(() => {
			done();
		}, (err:Error) => {
			done(err);
		});
	});
};
