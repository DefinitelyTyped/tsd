/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import StatCounter = require('../../xm/lib/StatCounter');

export function assertion(stat: StatCounter, values: any, message: string) {
	assert.isObject(stat, message + ': stat');
	assert.isObject(values, message + ': values');
	assert.instanceOf(stat, StatCounter, message + ': stat');

	var obj = {};
	// only check required values? hmm...
	Object.keys(values).forEach((key: string) => {
		//  if (stat.has(key)) {
		obj[key] = stat.get(key);
		// }
	});
	assert.deepEqual(obj, values, message + ': stat');
}
