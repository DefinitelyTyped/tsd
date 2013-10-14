///<reference path="../../tsdHelper.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseDefVersion(file:tsd.DefVersion, recursive:boolean):any {
		xm.assertVar('file', file, tsd.DefVersion);

		var json:any = {};
		json.path = file.def.path;
		json.commit = helper.serialiseDefCommit(file.commit, false);
		if (file.blob) {
			json.blob = helper.serialiseDefBlob(file.blob, false);
		}
		json.key = file.key;
		json.solved = file.solved;
		if (file.dependencies) {
			json.dependencies = [];
			file.dependencies.forEach((def:tsd.Def) => {
				json.dependencies.push(helper.serialiseDef(def, false));
			});
		}
		return json;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDefVersion(file:tsd.DefVersion, values:any, recursive:boolean, message:string) {
		assert.ok(file, message + ': file');
		assert.ok(values, message + ': values');
		assert.instanceOf(file, tsd.DefVersion, message + ': file');

		if (values.path) {
			assert.strictEqual(file.def.path, values.path, message + ': file.path');
		}
		if (values.commit) {
			helper.assertDefCommit(file.commit, values.commit, message + ': file.commit');
		}
		if (values.blob) {
			helper.assertDefBlob(file.blob, values.blob, message + ': file.blob');
		}
		if (typeof values.solved !== 'undefined') {
			assert.isBoolean(values.solved, message + ': values.solved');
			//helper.propStrictEqual(file, values, 'email', message + ': file');
		}
		if (values.info) {
			helper.assertDefInfo(file.info, values.info, message + ': file.info');
		}
		if (values.dependencies) {
			helper.assertDefArray(file.dependencies, values.dependencies, 'file.dependencies');
		}
	}

	export function assertDefVersionFlat(file:tsd.DefVersion, values:any, message:string) {
		assertDefVersion(file, values, false, message);
	}

	var assertDefVersionArrayUnordered:AssertCB = helper.getAssertUnorderedLike((act:tsd.DefVersion, exp:any) => {
		return (act.def.path === exp.path && act.commit.commitSha === exp.commit.commitSha);
	}, (act:tsd.DefVersion, exp:any, message?:string) => {
		assertDefVersion(act, exp, false, message + ': ' + tsd.shaShort(exp.commit.commitSha));
	}, 'DefVersion');

	export function assertDefVersionArray(files:tsd.DefVersion[], values:any[], message:string) {
		assertDefVersionArrayUnordered(files, values, message + ': files');
	}
}