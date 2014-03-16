/// <reference path="../../../globals.ts" />
/// <reference path="../../../../src/tsd/select/Query.ts" />
/// <reference path="../../../../src/xm/hash.ts" />
/// <reference path="../../../../src/xm/file/file.ts" />

/// <reference path="../../../../src/tsd/data/Def.ts" />
/// <reference path="../../../../src/tsd/select/Query.ts" />
/// <reference path="../../../../src/tsd/select/NameMatcher.ts" />

describe('NameMatcher', () => {
	'use strict';

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	describe('basics', () => {
		it('is defined', () => {
			assert.isFunction(tsd.NameMatcher, 'NameMatcher');
		});
	});

	var list:tsd.Def[];
	var files:tsd.Def[];
	var select:any = {};

	// get data to generate cases
	select.data = xm.file.readJSONSync(path.resolve(__dirname, '..', 'fixtures', 'nameMatcher.json'));
	select.source = xm.file.readJSONSync(path.resolve(__dirname, '..', 'fixtures', 'paths-many.json'));
	assert.ok(select.data, 'select.data');
	assert.ok(select.source, 'select.source');

	before(() => {
		// dummy list
		list = [];

		var badFixtures:string[] = [];
		select.source.forEach((path:string) => {
			var def = tsd.Def.getFrom(path);
			if (!def) {
				badFixtures.push(path);
			}
			list.push(def);
		});
		if (badFixtures.length > 0) {
			xm.log.error('bad fixture', badFixtures);
			throw new Error('bad fixtures: ' + badFixtures.join('\n'));
		}
	});
	after(() => {
		list = null;
		files = null;
		select = null;
	});

	function assertMatch(str:string, path:string, expectMatch:boolean = true) {
		path += '.d.ts';

		var pattern = new tsd.NameMatcher(str);
		var def = tsd.Def.getFrom(path);
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
	});

	describe('bulk', () => {
		select.data.forEach((data:any) => {
			it('match "' + String(data.pattern) + '"', () => {
				var pattern = new tsd.NameMatcher(data.pattern);

				var paths = pattern.filter(list, []).map((def:tsd.Def) => {
					return def.path;
				});

				assert.isArray(paths, 'paths');
				assert.lengthOf(paths, data.result.length, 'paths');
				assert.like(paths, data.result, 'paths');
			});
		});
	});

	describe('multi', () => {
		it('q', () => {
			assertMatch('q', 'q/Q', true);
		});
	});
});
