/// <reference path="_ref.d.ts" />
/// <reference path="globals.ts" />
/// <reference path="assert/xm/_all.ts" />
/// <reference path="assert/Map.ts" />
/// <reference path="../src/xm/data/PackageJSON.ts" />

module helper {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var Q:typeof Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var Reader:Qio.BufferReader = require('q-io/reader');
	var assert:Chai.Assert = require('chai').assert;
	var childProcess = require('child_process');
	var bufferEqual = require('buffer-equal');

	var shaRegExp = /^[0-9a-f]{40}$/;
	var md5RegExp = /^[0-9a-f]{32}$/;

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

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//helper to get a readable debug message (useful when comparing things absed on 2 paths)
	//can be improved freely (as required as it is for visualisation only)
	export function getPathMessage(pathA:string, pathB:string, message:string):string {
		//make absolute
		pathA = path.resolve(pathA);
		pathB = path.resolve(pathB);
		var elemsA = pathA.split(path.sep);
		var elemsB = pathB.split(path.sep);

		//remove identical parts
		while (elemsA.length > 0 && elemsB.length > 0 && elemsA[0] === elemsB[0]) {
			elemsA.shift();
			elemsB.shift();
		}

		//same paths?
		if (elemsA.length === 0 && elemsA.length === elemsB.length) {
			return message + ': \'' + path.basename(pathA) + '\'';
		}

		//different, print remains
		return message + ': ' + '\'' + elemsA.join(path.sep) + '\' vs \'' + elemsB.join(path.sep) + '\'';
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function longAssert(actual:string, expected:string, msg?:string):void {
		if (actual !== expected) {
			throw new chai.AssertionError((msg ? msg + ': ' : '') + ' long string', {
				actual: actual,
				expected: expected
			}, helper.longAssert);
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function dump(object:any, message?:string, depth:number = 6, showHidden:boolean = false):any {
		message = xm.isUndefined(message) ? '' : message + ': ';
		xm.log(message + util.inspect(object, showHidden, depth, true));
	}

	export function dumpJSON(object:any, message?:string):any {
		message = xm.isUndefined(message) ? '' : message + ': ';
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

	//hackish to get more ingot then assert.throws()
	export function assertError(exec:() => void, expected:any, msg?:string):void {
		msg = (msg ? msg + ': ' : '');
		try {
			exec();
		}
		catch (e) {
			var errorMsg:any = e.message.toString().match(/.*/m);
			if (errorMsg) {
				errorMsg = errorMsg[0];
				if (xm.isRegExp(expected)) {
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

	//for safety
	function promiseDoneMistake():void {
		throw new Error('don\'t use a done() callback when using it.eventually()');
	}

	//monkey patch
	it.eventually = function eventually(expectation:string, assertion?:(call:() => void) => void):void {
		it(expectation, (done) => {
			Q(assertion(promiseDoneMistake)).done(() => {
				done();
			}, (err:Error) => {
				done(err);
			});
		});
	};

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export interface AssertCB<T> {
		(actual:T, expected:T, message:string):void;
	}
	export interface IsLikeCB<T> {
		(actual:T, expected:T):boolean;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//TODO update to verify exacter using the event/log solution when it's ready (xm.EventLog)
	export function assertUpdateStat(cache:xm.http.HTTPCache, message:string):void {
		var stats = cache.track;

		var items = cache.track.getItems().filter((item:xm.EventLogItem) => {
			return true;
		}).map((item:xm.EventLogItem) => {
			return item.action;
		});
		assert.operator(items, '>=', 0, 'items');

		//TOOD yuk.. rewrite for new caching system with EventLog
		///var sum:number;
		/*switch (helper.settings.cache) {
		 case CacheMode.forceRemote:
		 assert.operator(stats.get('cache-hit'), '===', 0, message + ': allRemote: cache-hit');
		 assert.operator(stats.get('load-success'), '>', 0, message + ': allRemote: load-success');
		 assert.operator(stats.get('write-success'), '===', 0, message + ': allRemote: write-success');
		 break;
		 case CacheMode.forceUpdate:
		 assert.operator(stats.get('cache-hit'), '===', 0, message + ': forceUpdate: cache-hit');

		 sum = stats.get('load-success') + stats.get('write-success');
		 assert.operator(sum, '>', 0, message + ': forceUpdate: sum (load-success + write-success)');
		 break;
		 case CacheMode.allowUpdate:
		 //assert.operator(stats.get('cache-hit'), '>=', 0, message + ': allowUpdate: cache-hit');
		 //assert.operator(stats.get('load-success'), '>=', 0, message + ': allowUpdate: load-success');
		 //assert.operator(stats.get('write-success'), '>=', 0, message + ': allowUpdate: write-success');

		 sum = stats.get('load-success') + stats.get('write-success') + stats.get('cache-hit');
		 assert.operator(sum, '>', 0, message + ': allowUpdate: sum (load-success + write-success + cache-hit)');
		 break;
		 case CacheMode.allowRemote:
		 assert.operator(stats.get('write-success'), '==', 0, message + ': allowRemote: write-success');

		 sum = stats.get('load-success') + stats.get('cache-hit');
		 assert.operator(sum, '>', 0, message + ': allowRemote: sum (load-success + cache-hit)');
		 break;
		 case CacheMode.forceLocal:
		 default:
		 assert.operator(stats.get('cache-hit'), '>', 0, message + ': noUpdate: cache-hit');
		 assert.operator(stats.get('load-success'), '===', 0, message + ': noUpdate: load-success');
		 assert.operator(stats.get('write-success'), '===', 0, message + ': noUpdate: write-success');
		 break;
		 }*/
	}
}
