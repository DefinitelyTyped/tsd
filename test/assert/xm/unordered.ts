/// <reference path="../../helper.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	// TODO test these assertions

	// helper: assert lists of unordered items
	// first finds an identity match, then applies real assertion
	export function assertUnorderedLike<T>(actual:T[], expected:T[], matcher:IsLikeCB<T>, assertion:AssertCB<T>, message:string) {
		assert.isArray(actual, 'actual');
		assert.isArray(expected, 'expected');
		assert.isFunction(matcher, 'matcher');
		assert.isFunction(assertion, 'assertion');
		assert.strictEqual(actual.length, expected.length, message + ': length not equal: ' + actual.length + ' != ' + expected.length);

		// clones
		var actualQueue = actual.slice(0);
		var expectedQueue = expected.slice(0);

		outer : while (actualQueue.length > 0) {
			var act = actualQueue.pop();
			for (var i = 0, ii = expectedQueue.length; i < ii; i++) {
				var exp = expectedQueue[i];

				// check if this combination should be asserted
				if (matcher(act, exp)) {
					// do assertion
					assertion(act, exp, message);
					expectedQueue.splice(i, 1);
					// jump
					continue outer;
				}
			}
			// use assert.deepEqual for diff report
			// assert(false, message + ': no matching element for actual: ' + xm.toValueStrim(act));
			assert.deepEqual([act], expectedQueue, message + ': no matching element for actual: ' + xm.toValueStrim(act));
		}
		// also bad
		if (expectedQueue.length > 0) {
			// use deepEqual for nice report
			assert.deepEqual([], expectedQueue, message + ': remaining expect elements: ' + expectedQueue.length);
		}
	}

	// get lazy wrapper for re-use
	export function getAssertUnorderedLike<T>(matcher:IsLikeCB<T>, assertion:AssertCB<T>, preLabel:string):AssertCBA<T> {
		return function assertUnorderedLikeWrap<T>(actual:T[], expected:T[], message?:string) {
			assertUnorderedLike(actual, expected, matcher, assertion, preLabel + ': ' + message);
		};
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// helper: assert lists of unordered items
	// naively hammers assertions: every element has to pass at least one comparative assertion
	export function assertUnorderedNaive<T>(actual:T[], expected:T[], assertion:AssertCB<T>, message:string):void {
		assert.isArray(actual, 'actual');
		assert.isArray(expected, 'expected');
		assert.isFunction(assertion, 'assertion');
		assert.strictEqual(actual.length, expected.length, message + ': length not equal: ' + actual.length + ' != ' + expected.length);

		// clones
		var actualQueue = actual.slice(0);
		var expectedQueue = expected.slice(0);

		outer : while (actualQueue.length > 0) {
			var act = actualQueue.pop();
			for (var i = 0, ii = expectedQueue.length; i < ii; i++) {
				var exp = expectedQueue[i];

				// try every assertion
				try {
					assertion(act, exp, message);

					// passed, remove it
					expectedQueue.splice(i, 1);
					// jump
					continue outer;
				}
				catch (err) {
					// maybe next one
				}
			}
			assert(false, message + ': no matching element for actual: ' + xm.toValueStrim(act));
		}
		// also bad
		if (expectedQueue.length > 0) {
			// use assert.deepEqual for diff report
			assert.deepEqual([], expectedQueue, message + ': remaining expect elements: ' + expectedQueue.length);
		}
	}

	// get lazy wrapper for re-use
	export function getAssertUnorderedNaive<T>(assertion:AssertCB<T>, preLabel:string):AssertCBA<T> {
		return function (actual:T[], expected:T[], message?:string) {
			assertUnorderedNaive(actual, expected, assertion, preLabel + ': ' + message);
		};
	}

	// abominables (use assert.sameMembers instead)
	export function assertUnorderedStrict<T>(actual:T[], expected:T[], message?:string) {
		assertUnorderedNaive(actual, expected, assert.strictEqual, message);
	}
}
