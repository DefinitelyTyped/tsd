/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');
import chai = require('chai');
var assert = chai.assert;

import joiAssert = require('joi-assert');

import fileIO = require('../../xm/fileIO');
import helper = require('../../test/helper');
import testConfig = require('../../test/tsd/Config');

import tsdHelper = require('../../test/tsdHelper');
import Context = require('../../tsd/context/Context');
import Core = require('../../tsd/logic/Core');
import DefIndex = require('../../tsd/data/DefIndex');

import configSchema = require('../../tsd/schema/config');

import Bundle = require('../../tsd/support/Bundle');
import BundleChange = require('../../tsd/support/BundleChange');

describe('Core', () => {

	var fixtureDir = helper.getDirNameFixtures();
	var tmpDir = helper.getDirNameTmp();

	var core: Core;
	var context: Context;

	function getCore(context: Context): Core {
		var core = new Core(context);
		tsdHelper.applyCoreUpdate(core);
		return core;
	}

	function assertConfig(path: string): Promise<void> {
		context.paths.configFile = path;
		var source = fileIO.readJSONSync(path);

		core = getCore(context);
		return core.config.readConfig(false).then(() => {
			testConfig.assertion(core.context.config, source, 'source data');
		});
	}

	function assertInvalidConfig(path: string, exp: RegExp): Promise<void> {
		context.paths.configFile = path;
		core = getCore(context);
		return assert.isRejected(core.config.readConfig(false), exp);
	}

	before(() => {
	});
	beforeEach(() => {
		context = tsdHelper.getContext();
		// TODO risky?
		context.paths.configFile = './test/fixtures/config/default.json';
	});
	afterEach(() => {
		context = null;
		core = null;
	});

	it('should be defined', () => {
		assert.isFunction(Core, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			core = getCore(null);
		});
	});

	describe('config.readConfig', () => {
		// TODO use the actual default
		it('should load default config data', () => {
			return assertConfig('./test/fixtures/config/default.json');
		});
		it('should load minimal config data', () => {
			return assertConfig('./test/fixtures/config/valid-minimal.json');
		});

		it('should fail on missing required data', () => {
			return assertInvalidConfig('./non-existing_____/tsd-json', /^cannot locate file/);
		});
		it('should fail on bad version value', () => {
			return assertInvalidConfig('./test/fixtures/config/version-invalid.json', /version fails to match the required pattern/);
		});

		it('should pass on missing optional data', () => {
			context.paths.configFile = './non-existing_____/json';
			core = getCore(context);
			return assert.isFulfilled(core.config.readConfig(true));
		});
	});

	describe('config.saveConfig', () => {
		it('should save modified data', () => {
			// copy temp for saving
			var saveFile = path.resolve(tmpDir, 'save-config.json');
			fileIO.writeFileSync(saveFile, fileIO.readFileSync('./test/fixtures/config/valid.json'));
			context.paths.configFile = saveFile;

			core = getCore(context);

			// modify test data
			var source = fileIO.readJSONSync(saveFile);
			var changed = fileIO.readJSONSync(saveFile);

			changed.path = 'some/other/path';
			changed.installed['bleh/blah.d.ts'] = changed.installed['async/async.d.ts'];
			delete changed.installed['async/async.d.ts'];

			return core.config.readConfig(false).then(() => {
				testConfig.assertion(core.context.config, source, 'core.context.config');

				// modify data
				core.context.config.path = 'some/other/path';
				core.context.config.getInstalled()[0].path = 'bleh/blah.d.ts';

				return core.config.saveConfig();
			}).then(() => {
				assert.notIsEmptyFile(context.paths.configFile);
				var json = fileIO.readJSONSync(context.paths.configFile);
				assert.like(json, changed, 'saved data json');
				joiAssert(json, configSchema, 'saved valid json');
				return null;
			});
		});
	});

	describe('index.getIndex', () => {
		it('should return data', () => {
			core = getCore(context);

			return core.index.getIndex().then((index: DefIndex) => {
				assert.isTrue(index.hasIndex(), 'index.hasIndex');
				assert.operator(index.list.length, '>', 200, 'index.list');
				// console.log(index.toDump());
				// TODO validate index data
				return null;
			});
		});
	});

	describe('bundle', () => {
		it('should read data', () => {
			core = getCore(context);

			var name = 'bundle-read';
			var baseDir = path.resolve(fixtureDir, name);

			core.context.config.bundle = path.resolve(baseDir, 'tsd.d.ts');
			core.context.config.path = path.resolve(baseDir);

			return core.bundle.readBundle(core.context.config.bundle, false).then((bundle: Bundle) => {
				assert.deepEqual(bundle.toArray(true, true).sort(), [
					'bar/bar.d.ts',
					'bar/baz.d.ts',
					'foo/foo.d.ts'
				]);
			});
		});

		it('should cleanup data', () => {
			core = getCore(context);

			var name = 'bundle-clean';
			var baseDir = path.resolve(fixtureDir, name);
			var testDir = path.resolve(tmpDir, name);

			core.context.config.bundle = path.resolve(testDir, 'tsd.d.ts');
			core.context.config.path = path.resolve(testDir);

			return helper.ncp(baseDir, testDir).then(() => {
				return core.bundle.cleanupBundle(core.context.config.bundle, true);
			}).then((changes: BundleChange) => {
				assert.deepEqual(changes.getAdded(true, true), [], 'getAdded');
				assert.deepEqual(changes.getRemoved(true, true).sort(), [
					'bar/bar.d.ts',
					'bar/baz.d.ts',
				], 'getRemoved');

				assert.isTrue(changes.someChanged(), 'someChanged');
				assert.isFalse(changes.someAdded(), 'someAdded');
				assert.isTrue(changes.someRemoved(), 'someRemoved');

				var expected = fileIO.readFileSync(path.resolve(testDir, 'expected.d.ts'), 'utf8').replace(/\r\n/g, '\n');
				var actual = fileIO.readFileSync(core.context.config.bundle, 'utf8').replace(/\r\n/g, '\n');
				assert.strictEqual(actual, expected);
			});
		});

		it('should update data', () => {
			core = getCore(context);

			var name = 'bundle-update';
			var baseDir = path.resolve(fixtureDir, name);
			var testDir = path.resolve(tmpDir, name);

			core.context.config.bundle = path.resolve(testDir, 'tsd.d.ts');
			core.context.config.path = path.resolve(testDir);

			return helper.ncp(baseDir, testDir).then(() => {
				return core.bundle.updateBundle(core.context.config.bundle, true);
			}).then((changes: BundleChange) => {
				assert.deepEqual(changes.getAdded(true, true).sort(), [
					'bar/bar.d.ts',
					'bar/baz.d.ts',
					'foo/fizz.d.ts'
				], 'getAdded');
				assert.deepEqual(changes.getRemoved(true, true), [
					'hoge/hoge.d.ts'
				], 'getRemoved');

				assert.isTrue(changes.someChanged(), 'someChanged');
				assert.isTrue(changes.someAdded(), 'someAdded');
				assert.isTrue(changes.someRemoved(), 'someRemoved');

				var expected = fileIO.readFileSync(path.resolve(testDir, 'expected.d.ts'), 'utf8').replace(/\r\n/g, '\n');
				var actual = fileIO.readFileSync(core.context.config.bundle, 'utf8').replace(/\r\n/g, '\n');
				assert.strictEqual(actual, expected);
			});
		});
	});
});
