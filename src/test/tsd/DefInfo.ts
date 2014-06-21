/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import assertVar = require('../../xm/assertVar');
import AuthorInfo = require('../../tsd/support/AuthorInfo');
import DefInfo = require('../../tsd/data/DefInfo');
import testAuthor = require('./AuthorInfo');

import unordered = require('../unordered');
import helper = require('../helper');

export function serialise(info: DefInfo, recursive: number = 0): any {
	assertVar(info, DefInfo, 'info');

	recursive -= 1;

	var json: any = {};
	json.name = info.name;
	json.version = info.version;

	json.projects = info.projects;
	json.references = info.references.slice(0);
	json.authors = [];
	if (info.authors) {
		info.authors.forEach((author: AuthorInfo) => {
			json.authors.push(testAuthor.serialise(author));
		});
	}
	return json;
}

export function assertion(info: DefInfo, values: any, message: string) {
	assert.ok(info, message + ': info');
	assert.ok(values, message + ': values');
	assert.instanceOf(info, DefInfo, message + ': info');

	helper.propStrictEqual(info, values, 'name', message);
	helper.propStrictEqual(info, values, 'version', message);

	assert.deepEqual(info.projects, values.projects, message + ': projects');
	unordered.assertionNaive(info.authors, values.authors, testAuthor.assertion, message + ': authors');
	assert.deepEqual(info.references, values.references, message + ': references');
}
/*
var assertAuthor = unordered.getAssertLike<AuthorInfo>((actual, expected) => {
	return actual.name == expected.name;
}, (actual, expected) => {
	testAuthor.assertion(actual, expected, 'author');
}, 'author');*/
