/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import assertVar = require('../../xm/assertVar');
import AuthorInfo = require('../../tsd/support/AuthorInfo');

import defUtil = require('../../tsd/util/defUtil');
import Def = require('../../tsd/data/Def');
import DefVersion = require('../../tsd/data/DefVersion');
import testDefCommit = require('./DefCommit');
import testDefInfo = require('./DefInfo');
import testDef = require('./Def');

import unordered = require('../unordered');
import helper = require('../helper');

export function serialise(file: DefVersion, recursive: number = 0): any {
	assertVar(file, DefVersion, 'file');
	recursive -= 1;

	var json: any = {};
	json.path = file.def.path;
	json.key = file.key;
	json.solved = file.solved;
	json.blobSha = file.blobSha;

	if (recursive >= 0) {
		json.commit = testDefCommit.serialise(file.commit, recursive);
	}
	if (file.dependencies && recursive >= 0) {
		json.dependencies = [];
		file.dependencies.forEach((def: Def) => {
			json.dependencies.push(testDef.serialise(def, recursive));
		});
	}
	return json;
}

export function assertion(file: DefVersion, values: any, message: string): void {
	assert.ok(file, message + ': file');
	assert.ok(values, message + ': values');
	assert.instanceOf(file, DefVersion, message + ': file');

	if (values.path) {
		assert.strictEqual(file.def.path, values.path, message + ': file.path');
	}
	if (values.commit) {
		testDefCommit.assertion(file.commit, values.commit, message + ': file.commit');
	}
	if (values.blobSha) {
		assert.strictEqual(file.blobSha, values.blobSha, message + ': file.blobSha');
	}
	if (typeof values.solved !== 'undefined') {
		assert.isBoolean(values.solved, message + ': values.solved');
		// helper.propStrictEqual(file, values, 'email', message + ': file');
	}
	if (values.info) {
		testDefInfo.assertion(file.info, values.info, message + ': file.info');
	}
	if (values.dependencies) {
		testDef.assertionArray(file.dependencies, values.dependencies, 'file.dependencies');
	}
}

export function assertionFlat(file: DefVersion, values: any, message: string): void {
	assertion(file, values, message);
}

// TODO should not be 'any' type
var assertDefVersionArrayUnordered: any = unordered.getAssertLike<DefVersion>((act: DefVersion, exp: any) => {
	return (act.def.path === exp.path && exp.commit && act.commit.commitSha === exp.commit.commitSha);
}, (act: DefVersion, exp: any, message?: string) => {
	assertion(act, exp, message + ': ' + defUtil.shaShort(exp.commit.commitSha));
}, 'DefVersion');

export function assertionArray(files: DefVersion[], values: any[], message: string): void {
	assertDefVersionArrayUnordered(files, values, message + ': files');
}
