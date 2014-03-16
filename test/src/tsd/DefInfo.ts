/// <reference path="../../_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;

import assertVar = require('../../../src/xm/assertVar');
import AuthorInfo = require('../../../src/xm/data/AuthorInfo');
import DefInfo = require('../../../src/tsd/data/DefInfo');
import testAuthor = require('../xm/AuthorInfo');

import unordered = require('../unordered');
import helper = require('../helper');

export function serialise(info: DefInfo, recursive: number = 0): any {
	assertVar(info, DefInfo, 'info');

	recursive -= 1;

	var json: any = {};
	json.name = info.name;
	json.description = info.description;
	json.projectUrl = info.projectUrl;
	json.reposUrl = info.reposUrl;
	json.references = info.references.slice(0);
	json.authors = [];
	if (info.authors && recursive >= 0) {
		info.authors.forEach((author: AuthorInfo) => {
			json.authors.push(testAuthor.serialise(author, recursive));
		});
	}
	return json;
}

export function assertion(info: DefInfo, values: any, message: string) {
	assert.ok(info, message + ': info');
	assert.ok(values, message + ': values');
	assert.instanceOf(info, DefInfo, message + ': info');

	helper.propStrictEqual(info, values, 'name', message);
	if (values.description) {
		assert.strictEqual(info.description, values.description, message + ': info.description');
	}
	helper.propStrictEqual(info, values, 'projectUrl', message);
	helper.propStrictEqual(info, values, 'reposUrl', message);

	if (values.authors) {
		unordered.assertionNaive(info.authors, values.authors, testAuthor.assertion, message + ': authors');
	}
	if (values.references) {
		unordered.assertionNaive(info.authors, values.authors, assert.strictEqual, message + ': authors');
	}
}
