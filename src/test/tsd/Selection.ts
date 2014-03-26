/// <reference path="../_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;

import assertVar = require('../../xm/assertVar');

import Def = require('../../tsd/data/Def');
import DefVersion = require('../../tsd/data/DefVersion');
import Selection = require('../../tsd/select/Selection');

import testDefVersion = require('./DefVersion');
import testDef = require('./Def');

export function serialise(selection: Selection, recursive: number = 0): any {
	assertVar(selection, Selection, 'selection');

	recursive -= 1;

	var json: any = {};
	json.selection = selection.selection.map((file: DefVersion) => {
		return testDefVersion.serialise(file, recursive);
	});
	json.definitions = selection.definitions.map((file: Def) => {
		return testDef.serialise(file, recursive);
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
		testDefVersion.assertionArray(selection.selection, values.selection, message + ': selection');
	}
	if (values.definitions) {
		testDef.assertionArray(selection.definitions, values.definitions, message + ': definitions');
	}
	if (values.error) {
		assert.jsonOf(values.error, selection.error, message + ': error');
	}
}
