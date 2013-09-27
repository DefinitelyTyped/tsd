///<reference path="../../helper.ts" />
///<reference path="../../../src/xm/StatCounter.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function assertStatCounter(stat:xm.StatCounter, values:any, message:string) {
		assert.isObject(stat, message + ': stat');
		assert.isObject(values, message + ': values');
		assert.instanceOf(stat, xm.StatCounter, message + ': stat');

		var obj = {};
		//only check required values? hmm...
		Object.keys(values).forEach((key:string) => {
			//if (stat.has(key)) {
			obj[key] = stat.get(key);
			//}
		});
		assert.deepEqual(obj, values, message + ': stat');
	}
}