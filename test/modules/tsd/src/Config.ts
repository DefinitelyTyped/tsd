/// <reference path="../../../globals.ts" />
/// <reference path="../../../tsdHelper.ts" />

/// <reference path="../../../../src/tsd/context/Config.ts" />

describe('Config', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var config:tsd.Config;

	beforeEach(() => {
		config = new tsd.Config(helper.getConfigSchema());
		config.log.enabled = false;
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
					var json = xm.file.readJSONSync('./test/fixtures/config/' + name + '.json');

					config.parseJSON(json, name);
					helper.assertConfig(config, json, name);
				});
			});
		});

		describe('invalid', () => {
			var invalid = [
				['missing-path', /^malformed config:/],
				['path-bad-chars', /^malformed config:/],
				['path-no-project', /^malformed config:/],
				['path-no-type', /^malformed config:/],
				['commit-lacking-length', /^malformed config:/],
				['commit-missing', /^malformed config:/],
				['commit-over-length', /^malformed config:/],
				['path-no-type', /^malformed config:/]
			];
			invalid.forEach((tuple) => {
				it('rejects "' + tuple[0] + '"', () => {
					assert.lengthOf(tuple, 2, 'tuple');

					var json = xm.file.readJSONSync('./test/fixtures/config/' + tuple[0] + '.json');
					assert.throws(() => {
						// xm.log(json);
						config.parseJSON(json, (<string>tuple[0]), false);

						// borky cast
					}, (<string>tuple[1]));
				});
			});
		});
	});
});
