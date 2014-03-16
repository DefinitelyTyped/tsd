/// <reference path="../../_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;

export function serialise(author: xm.AuthorInfo, recursive: number = 0): any {
	assertVar(author, xm.AuthorInfo, 'author');
	recursive -= 1;
	return author.toJSON();
}

export function assertion(author: xm.AuthorInfo, values: any, message: string) {
	assert.ok(author, message + ': author');
	assert.ok(values, message + ': values');
	assert.instanceOf(author, xm.AuthorInfo, message + ': author');

	helper.propStrictEqual(author, values, 'name', message);
	helper.propStrictEqual(author, values, 'url', message);
	helper.propStrictEqual(author, values, 'email', message);
}
