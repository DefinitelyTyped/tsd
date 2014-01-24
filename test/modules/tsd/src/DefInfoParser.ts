/// <reference path="../../../globals.ts" />
/// <reference path="../../../tsdHelper.ts" />
/// <reference path="../../../../src/xm/file.ts" />
/// <reference path="../helper/HeaderHelper.ts" />


describe('DefInfoParser', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var data:helper.HeaderAssert[];
	var filter:string[]; // = ['async', 'expect.js'];

	before((done:(err?) => void) => {
		// use old tsd-deftools loader
		helper.loadHeaderFixtures(path.resolve(__dirname, '..', 'fixtures', 'headers')).done((res:helper.HeaderAssert[]) => {
			assert.operator(res.length, '>', 0);
			data = res;
			if (filter) {
				data = data.filter((value:helper.HeaderAssert) => {
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

	describe.only('loop', () => {
		it('data ok', () => {
			assert.operator(data.length, '>', 0, 'data.length');
		});
		it('parse test data', () => {

			var actuals = [];
			var expecteds = [];

			function testProp(def:helper.HeaderAssert, actual:Object, expected:Object, data:Object, parsed:Object, prop:string):void {
				actual[prop] = parsed[prop];
				expected[prop] = data[prop];
			}

			data.forEach((def:helper.HeaderAssert) => {
				assert.ok(def, def.key + ' ok');

				var actual:any = {
					key:def.key
				};
				var expected:any = {
					key:def.key
				};

				var data = new tsd.DefInfo();
				var parser = new tsd.DefInfoParser(true);
				parser.parse(data, def.header);

				var parsed = def.fields.parsed;
				if (def.fields.fields) {
					def.fields.fields.forEach((field:string) => {
						testProp(def, actual, expected, data, parsed, field);
					});
				}
				else {
					testProp(def, actual, expected, data, parsed, 'name');
					testProp(def, actual, expected, data, parsed, 'projectUrl');
					testProp(def, actual, expected, data, parsed, 'reposUrl');

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
