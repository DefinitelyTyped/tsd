///<reference path="_ref.ts" />
///<reference path="../src/xm/io/FileUtil.ts" />
///<reference path="../src/xm/io/Logger.ts" />
///<reference path="../src/xm/data/PackageJSON.ts" />
///<reference path="../src/xm/StatCounter.ts" />
///<reference path="../src/xm/KeyValueMap.ts" />
///<reference path="../src/xm/inspect.ts" />
///<reference path="settings.ts" />

module helper {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var assert:chai.Assert = require('chai').assert;
	var q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');

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

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function dump(object:any, message?:string, depth?:number = 6, showHidden?:bool = false):any {
		message = xm.isUndefined(message) ? '' : message + ': ';
		xm.log(message + util.inspect(object, showHidden, depth, true));
	}

	export function dumpJSON(object:any, message?:string):any {
		message = xm.isUndefined(message) ? '' : message + ': ';
		xm.log(message + JSON.stringify(object, null, 4));
	}

	export function formatSHA1(value:any, msg?:string) {
		assert.isString(value, msg);
		assert.match(String(value), shaRegExp, msg);
	}

	export function formatMD5(value:any, msg?:string) {
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
		(actual, expected):bool;
	}

	//helper: assert lists of unordered items
	//first finds an identity match, then applies real assertion
	export function assertUnorderedLike(actual:any[], expected:any[], matcher:IsLikeCB, assertion:AssertCB, message:string) {
		assert.isArray(actual, 'actual');
		assert.isArray(expected, 'expected');

		//clones
		actual = actual.slice(0);
		expected = expected.slice(0);

		outer : while (actual.length > 0) {
			var act = actual.pop();
			for (var i = 0, ii = expected.length; i < ii; i++) {
				var exp = expected[i];

				//check if this combination should be asserted
				if (matcher(act, exp)) {
					//do assertion
					assertion(act, exp, message);
					expected.splice(i, 1);
					//jump
					continue outer;
				}
			}
			//use assert.deepEqual for diff report
			assert(false, message + ': no matching element for actual: ' + xm.toValueStrim(act));
		}
		//also bad
		if (expected.length > 0) {
			//use deepEqual for nice report
			assert.deepEqual([], expected, message + ': remaining expect elements: ' + expected.length);
		}
	}

	//get lazy wrapper for re-use
	export function getAssertUnorderedLike(matcher:IsLikeCB, assertion:AssertCB, preLabel:string):AssertCB {
		return function (actual:any[], expected:any[], message?:string) {
			assertUnorderedLike(actual, expected, matcher, assertion, preLabel + ': ' + message);
		};
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//helper: assert lists of unordered items
	//naively hammers assertions: every element has to pass exactly one comparative assertion
	export function assertUnorderedNaive(actual:any[], expected:any[], assertion:AssertCB, message:string) {
		assert.isArray(actual, 'actual');
		assert.isArray(expected, 'expected');

		//clones
		actual = actual.slice(0);
		expected = expected.slice(0);

		outer : while (actual.length > 0) {
			var act = actual.pop();
			for (var i = 0, ii = expected.length; i < ii; i++) {
				var exp = expected[i];

				//try every assertion
				try {
					assertion(act, exp, message);

					//passed, remove it
					expected.splice(i, 1);
					//jump
					continue outer;
				}
				catch (err) {
					//maybe next one
				}
			}
			assert(false, message + ': no matching element for actual: ' + xm.toValueStrim(act));
		}
		//also bad
		if (expected.length > 0) {
			//use assert.deepEqual for diff report
			assert.deepEqual([], expected, message + ': remaining expect elements: ' + expected.length);
		}
	}

	//get lazy wrapper for re-use
	export function getAssertUnorderedNaive(assertion:AssertCB, preLabel:string):AssertCB {
		return function (actual:any[], expected:any[], message?:string) {
			assertUnorderedNaive(actual, expected, assertion, preLabel + ': ' + message);
		};
	}

	//abominables
	export function assertUnorderedStrict(actual:any[], expected:any[], message?:string) {
		assertUnorderedNaive(actual, expected, assert.strictEqual, message);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertKeyValue(map:xm.IKeyValueMap, values:any, assertion:AssertCB, message:string) {
		assert.isObject(map, message + ': map');
		assert.isObject(values, message + ': values');
		assert.isFunction(values, message + ': assertion');

		var keys:string[] = map.keys();
		values.keys().forEach((key:string) => {
			var i = keys.indexOf(key);
			assert(i > -1, message + ': expected key "' + key + '"');
			keys.splice(i, 1);
			assert(map.has(key), message + ': missing key "' + key + '"');
			assertion(map.get(key), values[key], message + ': key "' + key + '"');
		});
		assert(keys.length === 0, message + ': unexpected keys remaining: ' + keys + '');
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertStatCounter(stat:xm.StatCounter, values:any, message:string) {
		assert.isObject(stat, message + ': stat');
		assert.isObject(values, message + ': values');
		assert.instanceOf(stat, xm.StatCounter, message + ': stat');

		var obj = {};
		Object.keys(values).forEach((key:string) => {
			//if (stat.has(key)) {
			obj[key] = stat.get(key);
			//}
		});
		assert.deepEqual(obj, values, message + ': stat');
	}
}