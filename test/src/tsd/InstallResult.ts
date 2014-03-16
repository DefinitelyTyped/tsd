/// <reference path="../../_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;

import assertVar = require('../../../src/xm/assertVar');
import collection = require('../../../src/xm/collection');
import InstallResult = require('../../../src/tsd/logic/InstallResult');

export function serialise(result: InstallResult, recursive: number = 0): any {
	assertVar(result, InstallResult, 'result');

	recursive -= 1;

	var json: any = {};
	if (result.written) {
		json.written = {};
		collection.keysOf(result.written).forEach((key: string) => {
			json.written[key] = helper.serialiseDefVersion(result.written.get(key), recursive);
		});
	}
	if (result.removed) {
		json.removed = {};
		collection.keysOf(result.removed).forEach((key: string) => {
			json.removed[key] = helper.serialiseDefVersion(result.removed.get(key), recursive);
		});
	}
	if (result.skipped) {
		json.skipped = {};
		collection.keysOf(result.skipped).forEach((key: string) => {
			json.skipped[key] = helper.serialiseDefVersion(result.skipped.get(key), recursive);
		});
	}
	return json;
}

export function assertion(result: InstallResult, values: any, message: string) {
	assert.isObject(result, message + ': result');
	assert.isObject(values, message + ': values');
	assert.instanceOf(result, InstallResult, message + ': result');

	if (values.written) {
		helper.assertMap(result.written, values.written, helper.assertDefVersionFlat, message + ': written');
	}
	if (values.removed) {
		helper.assertMap(result.removed, values.removed, helper.assertDefVersionFlat, message + ': removed');
	}
	if (values.skipped) {
		helper.assertMap(result.skipped, values.skipped, helper.assertDefVersionFlat, message + ': skipped');
	}
}
