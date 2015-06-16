/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import assertVar = require('../../xm/assertVar');
import GitCommitUser = require('../../git/model/GitCommitUser');
import helper = require('../../test/helper');

export function serialise(user: GitCommitUser): any {
	assertVar(user, GitCommitUser, 'author');

	return {
		name: user.name,
		email: user.email,
		date: user.date.toISOString()
	};
}

export function assertion(user: GitCommitUser, values: any, message: string) {
	if (!values) {
		assert.strictEqual(user, values, message);
	}
	else {
		assert.ok(user, message + ': user');
		assert.instanceOf(user, GitCommitUser, message + ': user');

		helper.propStrictEqual(user, values, 'name', message);
		helper.propStrictEqual(user, values, 'email', message);

		assert.strictEqual(user.date.toISOString(), values.date, message + ': date');
	}
}
