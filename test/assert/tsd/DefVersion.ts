/// <reference path="../../tsdHelper.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseDefVersion(file:tsd.DefVersion, recursive:number = 0):any {
		xm.assertVar(file, tsd.DefVersion, 'file');
		recursive -= 1;

		var json:any = {};
		json.path = file.def.path;
		json.key = file.key;
		json.solved = file.solved;
		if (recursive >= 0) {
			json.commit = helper.serialiseDefCommit(file.commit, recursive);
			if (file.blob) {
				json.blob = helper.serialiseDefBlob(file.blob, recursive);
			}
		}
		if (file.dependencies && recursive >= 0) {
			json.dependencies = [];
			file.dependencies.forEach((def:tsd.Def) => {
				json.dependencies.push(helper.serialiseDef(def, recursive));
			});
		}
		return json;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDefVersion(file:tsd.DefVersion, values:any, message:string):void {
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
			// helper.propStrictEqual(file, values, 'email', message + ': file');
		}
		if (values.info) {
			helper.assertDefInfo(file.info, values.info, message + ': file.info');
		}
		if (values.dependencies) {
			helper.assertDefArray(file.dependencies, values.dependencies, 'file.dependencies');
		}
	}

	export function assertDefVersionFlat(file:tsd.DefVersion, values:any, message:string):void {
		assertDefVersion(file, values, message);
	}

	// TODO should not be 'any' type
	var assertDefVersionArrayUnordered:any = helper.getAssertUnorderedLike((act:tsd.DefVersion, exp:any) => {
		return (act.def.path === exp.path && exp.commit && act.commit.commitSha === exp.commit.commitSha);
	}, (act:tsd.DefVersion, exp:any, message?:string) => {
		assertDefVersion(act, exp, message + ': ' + tsd.shaShort(exp.commit.commitSha));
	}, 'DefVersion');

	export function assertDefVersionArray(files:tsd.DefVersion[], values:any[], message:string):void {
		assertDefVersionArrayUnordered(files, values, message + ': files');
	}
}
