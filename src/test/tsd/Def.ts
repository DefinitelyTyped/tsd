/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import assertVar = require('../../xm/assertVar');
import unordered = require('../unordered');

import Def = require('../../tsd/data/Def');
import DefVersion = require('../../tsd/data/DefVersion');

import testDefVersion = require('./DefVersion');
import helper = require('../helper');

export function serialise(def: Def, recursive: number = 0): any {
	assertVar(def, Def, 'def');
	recursive -= 1;

	var json: any = {};
	json.path = def.path;
	json.project = def.project;
	json.name = def.name;
	json.semver = def.semver;

	json.label = def.label;
	json.isMain = def.isMain;
	json.isLegacy = def.isLegacy;

	if (recursive >= 0) {
		json.head = testDefVersion.serialise(def.head, recursive);
	}
	// version from the DefIndex commit +tree (may be not our edit)
	if (def.history) {
		json.history = [];
		def.history.forEach((file: DefVersion) => {
			json.history.push(testDefVersion.serialise(file, recursive));
		});
	}
	return json;
}

export function assertion(def: Def, values: any, message: string) {
	assert.ok(def, message + ': def');
	assert.ok(values, message + ': values');
	assert.instanceOf(def, Def, message + ': def');

	helper.propStrictEqual(def, values, 'path', message);
	helper.propStrictEqual(def, values, 'name', message);
	helper.propStrictEqual(def, values, 'project', message);

	helper.propStrictEqual(def, values, 'label', message);
	helper.propStrictEqual(def, values, 'isMain', message);
	helper.propStrictEqual(def, values, 'isLegacy', message);

	if (values.semver) {
		helper.propStrictEqual(def, values, 'semver', message);
	}
	if (values.pathTerm) {
		helper.propStrictEqual(def, values, 'pathTerm', message);
	}
	if (values.head) {
		testDefVersion.assertion(def.head, values.head, message + '.head');
	}
	if (values.history) {
		// exactly this order
		for (var i = 0, ii = values.history.length; i < ii; i++) {
			testDefVersion.assertion(def.history[i], values.history[i], '#' + i);
		}
		helper.propStrictEqual(def.history, values.history, 'length', message);
	}
}

// TODO should not be 'any' type
var assertDefArrayUnordered: any = unordered.getAssertLike<Def>((act: Def, exp: Def) => {
	return (act.path === exp.path);
}, (act: Def, exp: Def, message: string) => {
	assertion(act, exp, message);
}, 'Def');

export function assertionArray(defs: Def[], values: any[], message: string) {
	assertDefArrayUnordered(defs, values, message);
}
