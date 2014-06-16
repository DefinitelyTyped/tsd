/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');

import tsdHelper = require('../../test/tsdHelper');
import Config = require('../../tsd/context/Config');
import testConfig = require('../../test/tsd/Config');

describe('Config', () => {

	var config: Config;

	beforeEach(() => {
		config = new Config();
	});
	afterEach(() => {
		config = null;
	});

	it('is instance', () => {
		assert.isObject(config);
	});

	describe('schema-validate own toJSON()', () => {
		it('return null on bad ref', () => {
			config.ref = '$$$$$';
			assert.throws(() => {
				config.toJSON();
			});
		});
		it('return null on bad path', () => {
			config.path = '';
			assert.throws(() => {
				config.toJSON();
			});
		});
		it('return null on bad version', () => {
			config.version = '321xyz';
			assert.throws(() => {
				config.toJSON();
			});
		});
		it('return null on bad repo', () => {
			config.repo = 'X ^ _ ^  X';
			assert.throws(() => {
				config.toJSON();
			});
		});
	});

	describe('schema', () => {
		describe('valid', () => {
			var valid = [
				'default',
				'valid',
				'valid-alt',
				'valid-minimal',
				'valid-short-commit'
			];
			valid.forEach((name) => {
				it('parses "' + name + '"', () => {
					var json = fileIO.readJSONSync('./test/fixtures/config/' + name + '.json');

					config.parseJSON(json, name);
					testConfig.assertion(config, json, name);
				});
			});
		});

		describe('invalid', () => {
			var invalid = [
				['bundle-not-ts', /bundle fails to match the required pattern/],
				['commit-bad-chars', /commit fails to match the required pattern/],
				['commit-lacking-length', /commit fails to match the required pattern/],
				['commit-missing', /commit fails to match the required pattern/],
				['commit-over-length', /commit fails to match the required pattern/],
				['installed-path-bad-chars', /project%\/modu   le\.d\.ts/],
				['installed-path-no-project', /module\.d\.ts is not allowed/],
				['installed-path-no-type', /project&#x2f;module is not allowed/],
				['path-lacking-length', /path is not allowed to be empty/],
				['path-missing',  /path is required/],
				['ref-missing',  /ref is required/],
				['ref-invalid',  /ref fails to match the required pattern/],
				['repo-missing',  /repo is required/],
				['repo-invalid',  /repo fails to match the required pattern/],
				['version-invalid',  /version fails to match the required pattern/],
				['version-missing',  /version is required/]
			];
			invalid.forEach((tuple: any[]) => {
				it('rejects "' + tuple[0] + '"', () => {
					assert.lengthOf(tuple, 2, 'tuple');
					// borky cast
					var name = <string> tuple[0];
					var regex = <RegExp> tuple[1];

					var json = fileIO.readJSONSync('./test/fixtures/config/' + name + '.json');

					assert.throws(() => {
						config.parseJSON(json, name);
					}, regex);
				});
			});
		});
	});
});
