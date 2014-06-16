/// <reference path="_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import inspect = require('../xm/inspect');

import assertLike = require('./assertLike');
import IsLikeCB = assertLike.IsLikeCB;
import AssertCB = assertLike.AssertCB;
import AssertCBA = assertLike.AssertCBA;

// TODO test these assertions

// helper: assert lists of unordered items
// first finds an identity match, then applies real assertion
export function assertionLike<T>(actual: T[], expected: T[], matcher: IsLikeCB<T>, assertion: AssertCB<T>, message: string) {
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
		// assert(false, message + ': no matching element for actual: ' + toValueStrim(act));
		assert.deepEqual([act], expectedQueue, message + ': no matching element for actual: ' + inspect.toValueStrim(act));
	}
	// also bad
	if (expectedQueue.length > 0) {
		// use deepEqual for nice report
		assert.deepEqual([], expectedQueue, message + ': remaining expect elements: ' + expectedQueue.length);
	}
}

// get lazy wrapper for re-use
export function getAssertLike<T>(matcher: IsLikeCB<T>, assertion: AssertCB<T>, preLabel: string): AssertCBA<T> {
	return function <T>(actual: T[], expected: T[], message?: string) {
		assertionLike(actual, expected, matcher, assertion, preLabel + ': ' + message);
	};
}

// helper: assert lists of unordered items
// naively hammers assertions: every element has to pass at least one comparative assertion
export function assertionNaive<T>(actual: T[], expected: T[], assertion: AssertCB<T>, message: string): void {
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
		assert(false, message + ': no matching element for actual: ' + inspect.toValueStrim(act));
	}
	// also bad
	if (expectedQueue.length > 0) {
		// use assert.deepEqual for diff report
		assert.deepEqual([], expectedQueue, message + ': remaining expect elements: ' + expectedQueue.length);
	}
}

// get lazy wrapper for re-use
export function getAssertionNaive<T>(assertion: AssertCB<T>, preLabel: string): AssertCBA<T> {
	return function (actual: T[], expected: T[], message?: string) {
		assertionNaive(actual, expected, assertion, preLabel + ': ' + message);
	};
}

// abominables (use assert.sameMembers instead)
export function assertionStrict<T>(actual: T[], expected: T[], message?: string) {
	assertionNaive(actual, expected, assert.strictEqual, message);
}
