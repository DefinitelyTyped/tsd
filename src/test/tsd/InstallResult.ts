/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
import assert = chai.assert;

import assertVar = require('../../xm/assertVar');
import collection = require('../../xm/collection');
import InstallResult = require('../../tsd/logic/InstallResult');
import DefVersion = require('../../tsd/data/DefVersion');
import testDefCommit = require('./DefCommit');
import testDefVersion = require('./DefVersion');
import testMap = require('../Map');

export function serialise(result: InstallResult, recursive: number = 0): any {
	assertVar(result, InstallResult, 'result');

	recursive -= 1;

	var json: any = {};
	if (result.written) {
		json.written = {};
		collection.keysOf(result.written).forEach((key: string) => {
			json.written[key] = testDefVersion.serialise(result.written.get(key), recursive);
		});
	}
	if (result.removed) {
		json.removed = {};
		collection.keysOf(result.removed).forEach((key: string) => {
			json.removed[key] = testDefVersion.serialise(result.removed.get(key), recursive);
		});
	}
	if (result.skipped) {
		json.skipped = {};
		collection.keysOf(result.skipped).forEach((key: string) => {
			json.skipped[key] = testDefVersion.serialise(result.skipped.get(key), recursive);
		});
	}
	return json;
}

export function assertion(result: InstallResult, values: any, message: string) {
	assert.isObject(result, message + ': result');
	assert.isObject(values, message + ': values');
	assert.instanceOf(result, InstallResult, message + ': result');

	if (values.written) {
		testMap.assertion<DefVersion>(result.written, values.written, testDefVersion.assertionFlat, message + ': written');
	}
	if (values.removed) {
		testMap.assertion<DefVersion>(result.removed, values.removed, testDefVersion.assertionFlat, message + ': removed');
	}
	if (values.skipped) {
		testMap.assertion<DefVersion>(result.skipped, values.skipped, testDefVersion.assertionFlat, message + ': skipped');
	}
}
