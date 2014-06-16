/// <reference path="../_ref.d.ts" />

'use strict';

import joiAssert = require('joi-assert');

import chai = require('chai');
import assert = chai.assert;

import assertVar = require('../../xm/assertVar');
import Config = require('../../tsd/context/Config');
import configSchema = require('../../tsd/schema/config');

import helper = require('../helper');
import tsdHelper = require('../tsdHelper');

export function assertion(config: Config, values: any, message: string) {
	assert.ok(config, message + ': config');
	assert.ok(values, message + ': values');
	assert.instanceOf(config, Config, message + ': config');

	helper.propStrictEqual(config, values, 'path', message);
	helper.propStrictEqual(config, values, 'version', message);
	helper.propStrictEqual(config, values, 'repo', message);
	helper.propStrictEqual(config, values, 'ref', message);

	if (values.repoOwner) {
		helper.propStrictEqual(config, values, 'repoOwner', message);
	}
	if (values.repoProject) {
		helper.propStrictEqual(config, values, 'repoProject', message);
	}

	var json = config.toJSON();

	joiAssert(json, configSchema, message + ': schema');
	helper.propStrictEqual(json, values, 'path', message + ': json');
	helper.propStrictEqual(json, values, 'version', message + ': json');
	helper.propStrictEqual(json, values, 'repo', message + ': json');
	helper.propStrictEqual(json, values, 'ref', message + ': json');

	if (values.installed) {
		assert.like(json.installed, values.installed);
	}
	else {
		assert.like(json.installed, {});
	}
}
