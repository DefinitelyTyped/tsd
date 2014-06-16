/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
var assert = chai.assert;

import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');

import tsdHelper = require('../../test/tsdHelper');
import Def = require('../../tsd/data/Def');

describe('Def', () => {
	
	var fixtures = helper.getDirNameFixtures();

	function assertIsDef(path: string, expectMatch: boolean = true) {
		assert.isString(path, 'path');
		if (expectMatch) {
			assert(Def.isDefPath(path), 'expected "' + path + '" to be a Def path');

			// double check
			var def = Def.getFrom(path);
			assert.instanceOf(def, Def);
		}
		else {
			assert(!Def.isDefPath(path), 'expected "' + path + '" to not be a Def path');
		}
	}

	function assertDefFrom(path: string, fields: any, trim: boolean) {
		assert.isString(path, 'path');
		assert.isObject(fields, 'fields');

		var def = Def.getFrom(path, trim);
		assert.isObject(def, 'def');
		assert.strictEqual(def.project, fields.project, 'def.project');
		assert.strictEqual(def.name, fields.name, 'def.name');

		if (fields.semver) {
			assert.strictEqual(def.semver, fields.semver, 'def.semver');
		}
		else {
			assert.notOk(def.semver, 'def.semver');
		}
	}

	describe('basics', () => {
		it('is defined', () => {
			assert.isFunction(Def, 'Def');
		});
	});

	describe('isDef', () => {
		var data: any = fileIO.readJSONSync(path.resolve(fixtures, 'is-path.json'));
		after(() => {
			data = null;
		});
		Object.keys(data).forEach((label) => {
			describe(label, () => {
				Object.keys(data[label]).forEach((path) => {
					var expect = data[label][path];
					it((expect ? 'pass' : 'fail') + ' "' + path + '"', () => {
						assertIsDef(path, expect);
					});
				});
			});
		});
	});

	describe('getFrom', () => {
		var data: any = fileIO.readJSONSync(path.resolve(fixtures, 'parse-path.json'));
		after(() => {
			data = null;
		});
		Object.keys(data).forEach((label) => {
			describe(label, () => {
				Object.keys(data[label]).forEach((path) => {
					var fields = data[label][path];
					it('test "' + path + '"', () => {
						assertDefFrom(path, fields, false);
					});
				});
			});
		});
	});

	describe('getFrom trimmed', () => {
		var data: any = fileIO.readJSONSync(path.resolve(fixtures, 'parse-path-trim.json'));
		after(() => {
			data = null;
		});
		Object.keys(data).forEach((label) => {
			describe(label, () => {
				Object.keys(data[label]).forEach((path) => {
					var fields = data[label][path];
					it('test "' + path + '"', () => {
						assertDefFrom(path, fields, true);
					});
				});
			});
		});
	});
});
