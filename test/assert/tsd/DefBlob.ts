///<reference path="../../tsdHelper.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseDefBlob(blob:tsd.DefBlob, recursive:boolean):any {
		xm.assertVar('blob', blob, tsd.DefBlob);

		var json:any = {};
		json.sha = blob.sha;
		if (blob.content && recursive) {
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

		if (values.content) {
			//TODO add reliable decoder
			assert.strictEqual(blob.content.toString('base64'), values.content, message + ': content');
		}
	}
}