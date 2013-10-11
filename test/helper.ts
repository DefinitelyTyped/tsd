///<reference path="globals.ts" />
///<reference path="assert/xm/_all.ts" />
///<reference path="assert/xm/unordered.ts" />
///<reference path="../src/xm/data/PackageJSON.ts" />

module helper {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var Q:typeof Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var assert:Chai.Assert = require('chai').assert;
	var shaRegExp = /^[0-9a-f]{40}$/;
	var md5RegExp = /^[0-9a-f]{32}$/;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function pad(num:number, len:number):string {
		var ret = num.toString(10);
		while (ret.length < len) {
			ret = '0' + ret;
		}
		return ret;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function getProjectRoot():string {
		return path.dirname(xm.PackageJSON.find());
	}

	export function getDirNameFixtures():string {
		return path.resolve(__dirname, '..', 'fixtures');
	}

	export function getDirNameTmp():string {
		return path.resolve(__dirname, '..', 'tmp');
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function dump(object:any, message?:string, depth:number = 6, showHidden:boolean = false):any {
		message = xm.isUndefined(message) ? '' : message + ': ';
		xm.log(message + util.inspect(object, showHidden, depth, true));
	}

	export function dumpJSON(object:any, message?:string):any {
		message = xm.isUndefined(message) ? '' : message + ': ';
		xm.log(message + JSON.stringify(object, null, 4));
	}

	export function isStringSHA1(value:any, msg?:string) {
		assert.isString(value, msg);
		assert.match(String(value), shaRegExp, msg);
	}

	export function isStringMD5(value:any, msg?:string) {
		assert.isString(value, msg);
		assert.match(String(value), md5RegExp, msg);
	}

	export function propStrictEqual(actual, expected, prop, message) {
		assert.strictEqual(actual[prop], expected[prop], message + '.' + prop);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export interface AssertCB {
		(actual, expected, message:string):void;
	}
	export interface IsLikeCB {
		(actual, expected):boolean;
	}
}
