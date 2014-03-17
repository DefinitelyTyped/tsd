/// <reference path="../../_ref.d.ts" />

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import fileIO = require('../../xm/file/fileIO');
import DefInfo = require('../../tsd/data/DefInfo');
import DefInfoParser = require('../../tsd/support/DefInfoParser');

import helper = require('../../test/helper');
import headerHelper = require('../../test/tsd/headerHelper');
import HeaderAssert = headerHelper.HeaderAssert;

describe('DefInfoParser', () => {
	'use strict';

	var fixtures = helper.getDirNameFixtures();

	var data: HeaderAssert[];
	var filter: string[]; // = ['async', 'expect.js'];

	before((done: (err?) => void) => {
		// use old tsd-deftools loader
		headerHelper.loadrFixtures(path.resolve(fixtures, 'headers')).done((res: HeaderAssert[]) => {
			assert.operator(res.length, '>', 0);
			data = res;
			if (filter) {
				data = data.filter((value: HeaderAssert) => {
					return filter.indexOf(value.name) > -1;
				});
			}
			done();
		}, done);
	});

	after(() => {
		data = null;
		filter = null;
	});

	describe('loop', () => {
		it('data ok', () => {
			assert.operator(data.length, '>', 0, 'data.length');
		});
		it('parse test data', () => {

			var actuals = [];
			var expecteds = [];

			function testProp(item: HeaderAssert, actual: Object, expected: Object, data: Object, parsed: Object, prop: string): void {
				actual[prop] = parsed[prop];
				expected[prop] = data[prop];
			}

			data.forEach((item: HeaderAssert) => {
				assert.ok(item, item.key + ' ok');

				var actual: any = {
					key: item.key
				};
				var expected: any = {
					key: item.key
				};

				var data = new DefInfo();
				var parser = new DefInfoParser(false);
				parser.parse(data, item.header);

				var parsed = item.fields.parsed;

				assert.ok(parsed, item.key + ' parsed (test fixture)');

				if (item.fields.fields) {
					item.fields.fields.forEach((field: string) => {
						testProp(item, actual, expected, data, parsed, field);
					});
				}
				else {
					testProp(item, actual, expected, data, parsed, 'name');
					testProp(item, actual, expected, data, parsed, 'projectUrl');
					testProp(item, actual, expected, data, parsed, 'reposUrl');

					actual.authors = data.authors.map((author) => {
						return author.toJSON();
					});
					expected.authors = parsed.authors;
				}
				actuals.push(actual);
				expecteds.push(expected);
			});


			assert.deepEqual(actuals, expecteds);
		});
	});
});
