/// <reference path="../../_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;
import helper = require('../../test/helper');

import StatCounter = require('../../xm/lib/StatCounter');

describe('StatCounter', () => {
	'use strict';
	var counter: StatCounter;

	beforeEach(() => {
		counter = new StatCounter();
	});
	afterEach(() => {
		counter = null;
	});
	it('is instanced', () => {
		assert.isObject(counter);
	});
	it('starts empty', () => {
		assert.strictEqual(counter.total(), 0, 'total');
		assert.deepEqual(counter.counterNames(), [], 'counterNames');
		assert.isTrue(counter.hasAllZero(), 'hasAllZero');
	});

	it('should unset counter as 0', () => {
		assert.strictEqual(counter.get('alpha'), 0, 'alpha');
	});

	it('should count()', () => {
		counter.count('alpha');
		counter.count('alpha');
		counter.count('bravo');
		assert.strictEqual(counter.get('alpha'), 2, 'alpha');
		assert.strictEqual(counter.get('bravo'), 1, 'bravo');
		assert.strictEqual(counter.total(), 3, 'total');
		assert.deepEqual(counter.counterNames(), ['alpha', 'bravo'], 'counterNames');
		assert.isFalse(counter.hasAllZero(), 'hasAllZero false');
	});

	it('should zero()', () => {
		counter.count('alpha');
		counter.count('alpha');
		counter.count('bravo');

		counter.zero();

		assert.strictEqual(counter.get('alpha'), 0, 'alpha');
		assert.strictEqual(counter.get('bravo'), 0, 'bravo');
		assert.strictEqual(counter.total(), 0, 'total');
		assert.deepEqual(counter.counterNames(), ['alpha', 'bravo'], 'counterNames');
		assert.isTrue(counter.hasAllZero(), 'hasAllZero true');
	});

	it('should clear()', () => {
		counter.count('alpha');
		counter.count('alpha');
		counter.count('bravo');

		counter.clear();

		assert.strictEqual(counter.total(), 0, 'total');
		assert.deepEqual(counter.counterNames(), [], 'counterNames');
	});
});
