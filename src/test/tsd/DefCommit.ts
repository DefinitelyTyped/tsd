/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import assertVar = require('../../xm/assertVar');
import DefCommit = require('../../tsd/data/DefCommit');

import testGithubUser = require('../git/GithubUser');
import testGitCommitUser = require('../git/GitCommitUser');

import helper = require('../helper');

export function serialise(commit: DefCommit): any {
	assertVar(commit, DefCommit, 'commit');

	var json: any = {};
	json.commitSha = commit.commitSha;

	json.hubAuthor = commit.hubAuthor ? testGithubUser.serialise(commit.hubAuthor) : null;
	json.hubCommitter = commit.hubCommitter ? testGithubUser.serialise(commit.hubCommitter) : null;

	json.gitAuthor = commit.gitAuthor ? testGitCommitUser.serialise(commit.gitAuthor) : null;
	json.gitCommitter = commit.gitCommitter ? testGitCommitUser.serialise(commit.gitCommitter) : null;

	return json;
}

export function assertion(commit: DefCommit, values: any, message: string) {
	assert.ok(commit, message + ': commit');
	assert.ok(values, message + ': values');
	assert.instanceOf(commit, DefCommit, message + ': info');

	helper.propStrictEqual(commit, values, 'commitSha', message);
	helper.assertFormatSHA1(values.commitSha, message + ': values.commitSha');

	testGithubUser.assertion(commit.hubAuthor, values.hubAuthor, message + ': values.hubAuthor');
	testGithubUser.assertion(commit.hubCommitter, values.hubCommitter, message + ': values.hubCommitter');

	testGitCommitUser.assertion(commit.gitAuthor, values.gitAuthor, message + ': values.gitAuthor');
	testGitCommitUser.assertion(commit.gitCommitter, values.gitCommitter, message + ': values.gitCommitter');
}
