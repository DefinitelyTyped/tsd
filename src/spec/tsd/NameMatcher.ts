/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
var assert = chai.assert;

import fileIO = require('../../xm/fileIO');
import helper = require('../../test/helper');

import tsdHelper = require('../../test/tsdHelper');
import Def = require('../../tsd/data/Def');
import NameMatcher = require('../../tsd/select/NameMatcher');

describe('NameMatcher', () => {

	describe('basics', () => {
		it('is defined', () => {
			assert.isFunction(NameMatcher, 'NameMatcher');
		});
	});

	var list: Def[];
	var files: Def[];
	var select: any = {};

	// get data to generate cases
	select.data = fileIO.readJSONSync(path.resolve(helper.getDirNameFixtures(), 'nameMatcher.json'));
	select.source = fileIO.readJSONSync(path.resolve(helper.getDirNameFixtures(), 'paths-many.json'));
	assert.ok(select.data, 'select.data');
	assert.ok(select.source, 'select.source');

	before(() => {
		// dummy list
		list = [];

		var badFixtures: string[] = [];
		select.source.forEach((path: string) => {
			var def = Def.getFrom(path);
			if (!def) {
				badFixtures.push(path);
			}
			list.push(def);
		});
		if (badFixtures.length > 0) {
			console.error('bad fixture', badFixtures);
			throw new Error('bad fixtures: ' + badFixtures.join('\n'));
		}
	});
	after(() => {
		list = null;
		files = null;
		select = null;
	});

	function assertMatch(str: string, path: string, expectMatch: boolean = true) {
		path += '.d.ts';

		var pattern = new NameMatcher(str);
		var def = Def.getFrom(path);
		if (!def) {
			throw new Error('bad fixture: ' + path);
		}
		var paths = pattern.filter([def], []);
		if (expectMatch) {
			assert((paths.length === 1), 'expected match for "' + [str, path].join('" vs "') + '"');
		}
		else {
			assert((paths.length === 0), 'expected no match for "' + [str, path].join('" vs "') + '"');
		}
	}

	describe('basics', () => {
		it('single letter', () => {
			assertMatch('a', 'a/b', false);
			assertMatch('b', 'a/b', true);
			assertMatch('a/b', 'a/b', true);
			assertMatch('b/a', 'a/b', false);
		});
		it('two letters', () => {
			assertMatch('aa', 'aa/bb', false);
			assertMatch('bb', 'aa/bb', true);
			assertMatch('aa/bb', 'aa/bb', true);
			assertMatch('bb/aa', 'aa/bb', false);
		});
		it('seperated letters', () => {
			assertMatch('a-a', 'aa/bb', false);
			assertMatch('b-b', 'aa/bb', false);
			assertMatch('a-a/bb', 'aa/bb', false);
			assertMatch('aa/b-b', 'aa/bb', false);

			assertMatch('a-a', 'a-a/b-b', false);
			assertMatch('b-b', 'a-a/b-b', true);
			assertMatch('a-a/b-b', 'a-a/b-b', true);
			assertMatch('b-b/a-a', 'a-a/b-b', false);
		});
		it('casing', () => {
			assertMatch('AA', 'aa/bb', false);
			assertMatch('BB', 'aa/bb', true);
			assertMatch('Aa/Bb', 'aa/bb', true);
			assertMatch('aA/BB', 'aa/bb', true);
			assertMatch('aA/BB', 'aa/bb', true);
		});
	});

	describe('specific', () => {
		it('q', () => {
			assertMatch('q', 'q/Q', true);
		});
		it('foo', () => {
			assertMatch('foo', 'foo/bar', false);
		});
		it('foo/', () => {
			assertMatch('foo/', 'foo/bar', true);
		});
		it('/bar', () => {
			assertMatch('/bar', 'foo/bar', true);
		});
	});

	describe('bulk', () => {
		select.data.forEach((data: any) => {
			it('match "' + String(data.pattern) + '"', () => {
				var pattern = new NameMatcher(data.pattern);

				var paths = pattern.filter(list, []).map((def: Def) => {
					return def.path;
				});

				assert.isArray(paths, 'paths');
				assert.like(paths, data.result, 'paths');
				assert.lengthOf(paths, data.result.length, 'paths');
			});
		});
	});
});
