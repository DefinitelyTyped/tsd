///<reference path="../../tsdHelper.ts" />
///<reference path="../../../src/tsd/API.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseInstallResult(result:tsd.InstallResult, recursive:number = 0):any {
		xm.assertVar(result, tsd.InstallResult, 'result');

		recursive -= 1;

		var json:any = {};
		if (result.written) {
			json.written = {};
			xm.keysOf(result.written).forEach((key:string) => {
				json.written[key] = helper.serialiseDefVersion(result.written.get(key), recursive);
			});
		}
		if (result.removed) {
			json.removed = {};
			xm.keysOf(result.removed).forEach((key:string) => {
				json.removed[key] = helper.serialiseDefVersion(result.removed.get(key), recursive);
			});
		}
		if (result.skipped) {
			json.skipped = {};
			xm.keysOf(result.skipped).forEach((key:string) => {
				json.skipped[key] = helper.serialiseDefVersion(result.skipped.get(key), recursive);
			});
		}
		return json;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertInstallResult(result:tsd.InstallResult, values:any, message:string) {
		assert.isObject(result, message + ': result');
		assert.isObject(values, message + ': values');
		assert.instanceOf(result, tsd.InstallResult, message + ': result');

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
}