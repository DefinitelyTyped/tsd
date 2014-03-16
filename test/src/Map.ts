/// <reference path="../_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;

export function assertMap<V>(map: Map<string, V>, values: any, assertion: AssertCB<V>, message: string): void {
	assert.isObject(map, message + ': map');
	assert.isObject(values, message + ': values');
	assert.isFunction(assertion, message + ': assertion');

	var mapKeys: string[] = xm.keysOf(map).sort();
	var valueKeys: string[] = Object.keys(values).sort();

	assert.sameMembers(mapKeys, valueKeys, message + ': same paths');

	var keys: string[] = mapKeys.slice(0);
	valueKeys.forEach((key: string) => {
		var i = keys.indexOf(key);
		assert(i > -1, message + ': expected key "' + key + '"');
		keys.splice(i, 1);
		assert(map.has(key), message + ': missing key "' + key + '"');
		assertion(map.get(key), values[key], message + ': key "' + key + '"');
	});
	assert(keys.length === 0, message + ': unexpected keys remaining: ' + keys + '');
}
