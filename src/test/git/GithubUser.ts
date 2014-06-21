/// <reference path="../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;

import assertVar = require('../../xm/assertVar');
import GithubUser = require('../../git/model/GithubUser');
import helper = require('../../test/helper');

export function serialise(user: GithubUser): any {
	assertVar(user, GithubUser, 'author');

	return {
		id: user.id,
		login: user.login,
		avatar_url: user.avatar_url
	};
}

export function assertion(user: GithubUser, values: any, message: string) {
	if (!values) {
		assert.strictEqual(user, values, message);
	}
	else {
		assert.ok(user, message + ': user');
		assert.instanceOf(user, GithubUser, message + ': user');

		helper.propStrictEqual(user, values, 'id', message);
		helper.propStrictEqual(user, values, 'login', message);
		helper.propStrictEqual(user, values, 'avatar_url', message);
	}
}
