/// <reference path="../../_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;

import assertVar = require('../../../src/xm/assertVar');
import AuthorInfo = require('../../../src/xm/data/AuthorInfo');

export function serialise(author: AuthorInfo, recursive: number = 0): any {
	assertVar(author, AuthorInfo, 'author');
	return author.toJSON();
}

export function assertion(author: AuthorInfo, values: any, message: string) {
	assert.ok(author, message + ': author');
	assert.ok(values, message + ': values');
	assert.instanceOf(author, AuthorInfo, message + ': author');

	helper.propStrictEqual(author, values, 'name', message);
	helper.propStrictEqual(author, values, 'url', message);
	helper.propStrictEqual(author, values, 'email', message);
}
