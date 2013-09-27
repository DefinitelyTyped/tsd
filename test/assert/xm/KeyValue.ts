///<reference path="../../helper.ts" />
///<reference path="../../../src/xm/StatCounter.ts" />
///<reference path="../../../src/xm/KeyValueMap.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function assertKeyValue(map:xm.IKeyValueMap<any>, values:any, assertion:AssertCB, message:string) {
		assert.isObject(map, message + ': map');
		assert.isObject(values, message + ': values');
		assert.isFunction(assertion, message + ': assertion');

		var mapKeys:string[] = map.keys().sort();
		var valueKeys:string[] = Object.keys(values).sort();

		assert.sameMembers(mapKeys, valueKeys, message + ': same paths');

		var keys:string[] = map.keys();
		valueKeys.forEach((key:string) => {
			var i = keys.indexOf(key);
			assert(i > -1, message + ': expected key "' + key + '"');
			keys.splice(i, 1);
			assert(map.has(key), message + ': missing key "' + key + '"');
			assertion(map.get(key), values[key], message + ': key "' + key + '"');
		});
		assert(keys.length === 0, message + ': unexpected keys remaining: ' + keys + '');
	}
}