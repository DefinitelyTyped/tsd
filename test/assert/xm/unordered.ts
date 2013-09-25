///<reference path="../../helper.ts" />

module helper {
	'use strict';

	var assert = helper.assert;

	//helper: assert lists of unordered items
	//first finds an identity match, then applies real assertion
	export function assertUnorderedLike(actual:any[], expected:any[], matcher:IsLikeCB, assertion:AssertCB, message:string) {
		assert.isArray(actual, 'actual');
		assert.isArray(expected, 'expected');
		assert.strictEqual(actual.length, expected.length, message + ': length not equal: ' + actual.length + ' != ' + expected.length);

		//clones
		var actualQueue = actual.slice(0);
		var expectedQueue = expected.slice(0);

		outer : while (actualQueue.length > 0) {
			var act = actualQueue.pop();
			for (var i = 0, ii = expectedQueue.length; i < ii; i++) {
				var exp = expectedQueue[i];

				//check if this combination should be asserted
				if (matcher(act, exp)) {
					//do assertion
					assertion(act, exp, message);
					expected.splice(i, 1);
					//jump
					continue outer;
				}
			}
			if (expected.length > 0) {
				xm.log(expected);
			}
			//use assert.deepEqual for diff report
			assert(false, message + ': no matching element for actual: ' + xm.toValueStrim(act));
		}
		//also bad
		if (expected.length > 0 && expectedQueue.length > 0) {
			//use deepEqual for nice report
			assert.deepEqual([], expected, message + ': remaining expect elements: ' + expected.length);
		}
	}

	//get lazy wrapper for re-use
	export function getAssertUnorderedLike(matcher:IsLikeCB, assertion:AssertCB, preLabel:string):AssertCB {
		return function assertUnorderedLikeWrap(actual:any[], expected:any[], message?:string) {
			assertUnorderedLike(actual, expected, matcher, assertion, preLabel + ': ' + message);
		};
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//helper: assert lists of unordered items
	//naively hammers assertions: every element has to pass exactly one comparative assertion
	export function assertUnorderedNaive(actual:any[], expected:any[], assertion:AssertCB, message:string) {
		assert.isArray(actual, 'actual');
		assert.isArray(expected, 'expected');
		assert.strictEqual(actual.length, expected.length, message + ': length not equal: ' + actual.length + ' != ' + expected.length);

		//clones
		var actualQueue = actual.slice(0);
		var expectedQueue = expected.slice(0);

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
		if (expected.length > 0 && expectedQueue.length > 0) {
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

	//abominables (use assert.sameMembers instead)
	export function assertUnorderedStrict(actual:any[], expected:any[], message?:string) {
		assertUnorderedNaive(actual, expected, assert.strictEqual, message);
	}
}