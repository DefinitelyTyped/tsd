///<reference path="../../../globals.ts" />
///<reference path="../../../tsdHelper.ts" />
///<reference path="../../../../src/xm/io/FileUtil.ts" />
///<reference path="../helper/HeaderHelper.ts" />


describe('DefInfoParser', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	var data:helper.HeaderAssert[];
	var filter:string[]; // = ['async', 'expect.js'];

	before((done:(err?) => void) => {
		//use old tsd-deftools loader
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

	describe('loop', () => {
		it('data ok', () => {
			assert.operator(data.length, '>', 0, 'data.length');
		});
		it('parse test data', () => {
			function testProp(def:helper.HeaderAssert, data:Object, parsed:Object, prop:string):void {
				assert.strictEqual(data[prop], parsed[prop], def.key + ' .' + prop);
			}

			data.forEach((def:helper.HeaderAssert) => {
				assert.ok(def, def.key + ' ok');

				var data = new tsd.DefInfo();
				var parser = new tsd.DefInfoParser(false);
				parser.parse(data, def.header);

				var parsed = def.fields.parsed;
				if (def.fields.fields) {
					def.fields.fields.forEach((field:string) => {
						testProp(def, data, parsed, field);
					});
				}
				else {
					testProp(def, data, parsed, 'name');
					testProp(def, data, parsed, 'version');
					testProp(def, data, parsed, 'submodule');
					testProp(def, data, parsed, 'description');
					testProp(def, data, parsed, 'projectUrl');
					testProp(def, data, parsed, 'reposUrl');

					assert.like(data.authors.map((author) => {
						return author.toJSON();
					}), parsed.authors, def.key + ' .' + 'authors');
				}
			});
		});
	});
});
