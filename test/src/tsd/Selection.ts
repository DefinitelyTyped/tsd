/// <reference path="../../_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;

import assertVar = require('../../../src/xm/assertVar');
import DefVersion = require('../../../src/tsd/data/DefVersion');

export function serialis(selection: Selection, recursive: number = 0): any {
	assertVar(selection, Selection, 'selection');

	recursive -= 1;

	var json: any = {};
	json.selection = selection.selection.map((file: DefVersion) => {
		return helper.serialiseDefVersion(file, recursive);
	});
	json.definitions = selection.definitions.map((file: Def) => {
		return helper.serialiseDef(file, recursive);
	});
	if (selection.error) {
		json.error = JSON.stringify(selection.error, null, 2);
	}
	return json;
}

export function assertion(selection: Selection, values: any, message: string) {
	assert.isObject(selection, message + ': selection');
	assert.isObject(values, message + ': values');
	assert.instanceOf(selection, Selection, message + ': selection');

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
