///<reference path="../../tsdHelper.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseDefCommit(commit:tsd.DefCommit, recursive:boolean):any {
		xm.assertVar(commit, tsd.DefCommit, 'commit');

		var json:any = {};
		json.commitSha = commit.commitSha;
		//TODO serialise more DefCommit
		return json;
	}


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDefCommit(commit:tsd.DefCommit, values:any, message:string) {
		assert.ok(commit, message + ': commit');
		assert.ok(values, message + ': values');
		assert.instanceOf(commit, tsd.DefCommit, message + ': info');

		helper.propStrictEqual(commit, values, 'commitSha', message);
		helper.isStringSHA1(values.commitSha, message + ': values.commitSha');
	}
}