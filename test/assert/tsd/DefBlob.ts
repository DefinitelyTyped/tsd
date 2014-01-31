/// <reference path="../../tsdHelper.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseDefBlob(blob:tsd.DefBlob, recursive:number = 0):any {
		xm.assertVar(blob, tsd.DefBlob, 'blob');
		recursive -= 1;

		var json:any = {};
		json.sha = blob.sha;
		if (blob.content && recursive >= 0) {
			json.content = blob.content.toString('base64');
		}
		return json;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDefBlob(blob:tsd.DefBlob, values:any, message:string) {
		assert.ok(blob, message + ': blob');
		assert.ok(values, message + ': values');
		assert.instanceOf(blob, tsd.DefBlob, message + ': author');

		helper.propStrictEqual(blob, values, 'sha', message);

		if (values.lines) {
			assert.strictEqual(blob.content.toString('base64'), values.lines, message + ': content');
		}
	}
}
