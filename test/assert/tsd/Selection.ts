///<reference path="../../tsdHelper.ts" />
///<reference path="../../../src/tsd/API.ts" />
///<reference path="../../../src/tsd/select/Selection.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseSelection(selection:tsd.Selection, recursive:number = 0):any {
		xm.assertVar(selection, tsd.Selection, 'selection');

		recursive -= 1;

		var json:any = {};
		json.selection = selection.selection.map((file:tsd.DefVersion) => {
			return helper.serialiseDefVersion(file, recursive);
		});
		json.definitions = selection.definitions.map((file:tsd.Def) => {
			return helper.serialiseDef(file, recursive);
		});
		if (selection.error) {
			json.error = JSON.stringify(selection.error, null, 2);
		}
		return json;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertSelection(selection:tsd.Selection, values:any, message:string) {
		assert.isObject(selection, message + ': selection');
		assert.isObject(values, message + ': values');
		assert.instanceOf(selection, tsd.Selection, message + ': selection');

		if (values.selection) {
			helper.assertDefVersionArray(selection.selection, values.selection, message + ': selection');
		}
		if (values.definitions) {
			helper.assertDefArray(selection.definitions, values.definitions, message + ': definitions');
		}
		if (values.error) {
			assert.jsonOf(values.error, selection.error, message + ': error');
		}
	}
}