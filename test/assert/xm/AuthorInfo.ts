///<reference path="../../helper.ts" />
///<reference path="../../../src/xm/data/AuthorInfo" />

module helper {
	'use strict';

	var assert = helper.assert;

	export function serialiseAuthor(author:xm.AuthorInfo):any {
		xm.assertVar('author', author, xm.AuthorInfo);
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