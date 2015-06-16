/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import assertVar = require('../../xm/assertVar');
import AuthorInfo = require('../../tsd/support/AuthorInfo');
import helper = require('../../test/helper');

export function serialise(author: AuthorInfo): any {
	assertVar(author, AuthorInfo, 'author');
	return {
		name: author.name,
		url: author.url,
		email: author.email
	};
}

export function assertion(author: AuthorInfo, values: any, message: string) {
	assert.ok(author, message + ': author');
	assert.ok(values, message + ': values');
	assert.instanceOf(author, AuthorInfo, message + ': author');

	helper.propStrictEqual(author, values, 'name', message);
	helper.propStrictEqual(author, values, 'url', message);
	if (values.email) {
		helper.propStrictEqual(author, values, 'email', message);
	}
}
