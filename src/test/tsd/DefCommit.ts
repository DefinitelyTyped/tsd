/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import assertVar = require('../../xm/assertVar');
import DefCommit = require('../../tsd/data/DefCommit');

import helper = require('../helper');

export function serialise(commit: DefCommit, recursive: number = 0): any {
	assertVar(commit, DefCommit, 'commit');
	recursive -= 1;

	var json: any = {};
	json.commitSha = commit.commitSha;
	// TODO serialise more DefCommit
	return json;
}

export function assertion(commit: DefCommit, values: any, message: string) {
	assert.ok(commit, message + ': commit');
	assert.ok(values, message + ': values');
	assert.instanceOf(commit, DefCommit, message + ': info');

	helper.propStrictEqual(commit, values, 'commitSha', message);
	helper.assertFormatSHA1(values.commitSha, message + ': values.commitSha');
}
