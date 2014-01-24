/// <reference path="../../tsdHelper.ts" />
/// <reference path="../../tsdHelper.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseDefCommit(commit:tsd.DefCommit, recursive:number = 0):any {
		xm.assertVar(commit, tsd.DefCommit, 'commit');
		recursive -= 1;

		var json:any = {};
		json.commitSha = commit.commitSha;
		// TODO serialise more DefCommit
		return json;
	}


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDefCommit(commit:tsd.DefCommit, values:any, message:string) {
		assert.ok(commit, message + ': commit');
		assert.ok(values, message + ': values');
		assert.instanceOf(commit, tsd.DefCommit, message + ': info');

		helper.propStrictEqual(commit, values, 'commitSha', message);
		helper.assertFormatSHA1(values.commitSha, message + ': values.commitSha');
	}
}
