///<reference path="../../tsdHelper.ts" />
///<reference path="../../../src/tsd/API.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseAPIResult(result:tsd.APIResult, recursive:number = 0):any {
		xm.assertVar(result, tsd.APIResult, 'result');

		recursive -= 1;

		var json:any = {};
		if (result.error) {
			json.error = result.error;
		}
		if (result.selection) {
			json.selection = result.selection.map((file:tsd.DefVersion) => {
				return helper.serialiseDefVersion(file, recursive);
			});
		}
		if (result.nameMatches) {
			json.nameMatches = result.nameMatches.map((def:tsd.Def) => {
				return helper.serialiseDef(def, recursive);
			});
		}
		if (result.definitions) {
			json.definitions = result.definitions.map((def:tsd.Def) => {
				return helper.serialiseDef(def, recursive);
			});
		}
		if (result.written) {
			json.written = {};
			result.written.keys().forEach((key:string) => {
				json.written[key] = helper.serialiseDefVersion(result.written.get(key), recursive);
			});
		}
		return json;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertAPIResult(result:tsd.APIResult, values:any, message:string) {
		assert.ok(result, message + ': result');
		assert.ok(values, message + ': values');
		assert.instanceOf(result, tsd.APIResult, message + ': result');

		if (values.nameMatches) {
			helper.assertDefArray(result.nameMatches, values.nameMatches, message + ': nameMatches');
		}
		if (values.selection) {
			helper.assertDefVersionArray(result.selection, values.selection, message + ': selection');
		}
		if (values.definitions) {
			helper.assertDefArray(result.definitions, values.definitions, message + ': definitions');
		}
		if (values.written) {
			helper.assertKeyValue(result.written, values.written, helper.assertDefVersionFlat, message + ': written');
		}
	}
}