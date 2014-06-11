/// <reference path="../../_ref.d.ts" />

'use strict';

import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');

import PackageLinker = require('../../tsd/support/PackageLinker');
import PackageDefinition = require('../../tsd/support/PackageDefinition');

describe.only('PackageLinker', () => {

	var linkerFixtures = path.join(helper.getSharedFixtures(), 'linker');

	it('is constructor', () => {
		assert.isFunction(PackageLinker, 'PackageLinker');
		assert.isFunction(PackageDefinition, 'PackageDefinition');
	});

	function sortRes(a, b) {
		a.definitions.sort();
		b.definitions.sort();
		if (a.manager < b.manager) {
			return -1;
		}
		if (a.manager > b.manager) {
			return 1;
		}
		if (a.name < b.name) {
			return -1;
		}
		if (a.name > b.name) {
			return 1;
		}
		return 0;
	}

	it('reads packages', () => {
		var linker = new PackageLinker();

		return linker.scanDefinitions(linkerFixtures).then((refs: PackageDefinition[]) => {
			return fileIO.readJSON(path.join(linkerFixtures, 'expected.json')).then((expected) => {
				expected.sort(sortRes);
				refs.sort(sortRes);

				refs.forEach((elem) => {
					elem.definitions = elem.definitions.map((file) => {
						return path.relative(linkerFixtures, file).replace(/\\/g, '/');
					});
				});

				assert.deepEqual(refs, expected);
			});
		});
	});
});
