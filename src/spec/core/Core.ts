/// <reference path="../../_ref.d.ts" />

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');
import testConfig = require('../../test/tsd/Config');

import tsdHelper = require('../../test/tsdHelper');
import Context = require('../../tsd/context/Context');
import Core = require('../../tsd/logic/Core');
import DefIndex = require('../../tsd/data/DefIndex');

describe('Core', () => {
	'use strict';

	var fixtures = helper.getDirNameFixtures();
	var tmp = helper.getDirNameTmp();

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
		context.config.log.enabled = false;
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

	describe('readConfig', () => {
		// TODO use the actual default
		it('should load default config data', () => {
			return assertConfig('./test/fixtures/config/default.json');
		});
		it('should load minimal config data', () => {
			return assertConfig('./test/fixtures/config/valid-minimal.json');
		});

		it('should fail on missing required data', () => {
			return assertInvalidConfig('./non-existing_____/tsd-json', /^cannot locate file:/);
		});
		it('should fail on bad version value', () => {
			return assertInvalidConfig('./test/fixtures/config/invalid-version.json', /^malformed config:/);
		});

		it('should pass on missing optional data', () => {
			context.paths.configFile = './non-existing_____/json';
			core = getCore(context);
			return assert.isFulfilled(core.config.readConfig(true));
		});
	});
	describe('saveConfig', () => {
		it('should save modified data', () => {
			// copy temp for saving
			var saveFile = path.resolve(tmp, 'save-config.json');
			fileIO.writeFileSync(saveFile, fileIO.readFileSync('./test/fixtures/config/valid.json'));
			context.paths.configFile = saveFile;

			core = getCore(context);
			// core.verbose = true;

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
				assert.jsonSchema(json, tsdHelper.getConfigSchema(), 'saved valid json');
				return null;
			});
		});
	});

	describe('updateIndex', () => {
		it('should return data', () => {
			core = getCore(context);
			// core.verbose = true;

			return core.index.getIndex().then((index: DefIndex) => {
				assert.isTrue(index.hasIndex(), 'index.hasIndex');
				assert.operator(index.list.length, '>', 200, 'index.list');
				// xm.log(index.toDump());
				// TODO validate index data
				return null;
			});
		});
	});
});
