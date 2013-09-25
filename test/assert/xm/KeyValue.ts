///<reference path="../../helper.ts" />
///<reference path="../../../src/xm/StatCounter.ts" />

module helper {
	'use strict';

	var assert = helper.assert;

	export function assertKeyValue(map:xm.IKeyValueMap, values:any, assertion:AssertCB, message:string) {
		assert.isObject(map, message + ': map');
		assert.isObject(values, message + ': values');
		assert.isFunction(assertion, message + ': assertion');

		var keys:string[] = map.keys();
		Object.keys(values).forEach((key:string) => {
			var i = keys.indexOf(key);
			assert(i > -1, message + ': expected key "' + key + '"');
			keys.splice(i, 1);
			assert(map.has(key), message + ': missing key "' + key + '"');
			assertion(map.get(key), values[key], message + ': key "' + key + '"');
		});
		assert(keys.length === 0, message + ': unexpected keys remaining: ' + keys + '');
	}
}