/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');
import chai = require('chai');
var assert = chai.assert;

import fileIO = require('../../xm/fileIO');

import helper = require('../../test/helper');

import Bundle = require('../../tsd/support/Bundle');
import BundleManager = require('../../tsd/support/BundleManager');
import BundleChange = require('../../tsd/support/BundleChange');

describe('BundleManager', () => {

	var fixtureDir = helper.getDirNameFixtures();
	var tmpDir = helper.getDirNameTmp();

	it('should read data', () => {

		var name = 'bundle-read';
		var baseDir = path.resolve(fixtureDir, name);
		var testDir = path.resolve(tmpDir, name);

		var bundleFile = path.resolve(testDir, 'tsd.d.ts');
		var manager = new BundleManager(testDir);

		return helper.ncp(baseDir, testDir).then(() => {
			return manager.readBundle(bundleFile, false);
		}).then((bundle: Bundle) => {
			assert.deepEqual(bundle.toArray(true, true).sort(), [
				'bar/bar.d.ts',
				'bar/baz.d.ts',
				'foo/foo.d.ts'
			]);
		});
	});

	it('should cleanup data', () => {
		var name = 'bundle-clean';
		var baseDir = path.resolve(fixtureDir, name);
		var testDir = path.resolve(tmpDir, name);

		var bundleFile = path.resolve(testDir, 'tsd.d.ts');
		var manager = new BundleManager(testDir);

		return helper.ncp(baseDir, testDir).then(() => {
			return manager.cleanupBundle(bundleFile, true);
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
			var actual = fileIO.readFileSync(bundleFile, 'utf8').replace(/\r\n/g, '\n');
			assert.strictEqual(actual, expected);
		});
	});

	it('should update data', () => {

		var name = 'bundle-update';
		var baseDir = path.resolve(fixtureDir, name);
		var testDir = path.resolve(tmpDir, name);

		var bundleFile = path.resolve(testDir, 'tsd.d.ts');
		var manager = new BundleManager(testDir);

		return helper.ncp(baseDir, testDir).then(() => {
			return manager.updateBundle(bundleFile, true);
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
			var actual = fileIO.readFileSync(bundleFile, 'utf8').replace(/\r\n/g, '\n');
			assert.strictEqual(actual, expected);
		});
	});
});
