///<reference path="../../helper.ts" />
///<reference path="../../../src/xm/data/AuthorInfo" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseAuthor(author:xm.AuthorInfo, recursive:number = 0):any {
		xm.assertVar(author, xm.AuthorInfo, 'author');
		recursive -= 1;
		return author.toJSON();
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertAuthor(author:xm.AuthorInfo, values:any, message:string) {
		assert.ok(author, message + ': author');
		assert.ok(values, message + ': values');
		assert.instanceOf(author, xm.AuthorInfo, message + ': author');

		helper.propStrictEqual(author, values, 'name', message);
		helper.propStrictEqual(author, values, 'url', message);
		helper.propStrictEqual(author, values, 'email', message);
	}
}
