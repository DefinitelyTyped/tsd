///<reference path="../../tsdHelper.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseDefCommit(commit:tsd.DefCommit, recursive:boolean):any {
		xm.assertVar('commit', commit, tsd.DefCommit);

		var json:any = {};
		json.commitSha = commit.commitSha;
		//TODO serialise more DefCommit
		return json;
	}
}