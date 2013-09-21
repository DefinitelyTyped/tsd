///<reference path="../../../_ref.ts" />
///<reference path="../../../helper.ts" />
///<reference path="../../../../src/xm/io/FileUtil.ts" />
///<reference path="../helper/HeaderHelper.ts" />


describe('DefInfoParser', () => {
	var _ = require('underscore');
	var fs = require('fs');
	var path = require('path');

	var data:helper.HeaderAssert[];
	var filter;// = ['async', 'expect.js'];

	before((done:(err?) => void) => {
		//use old tsd-deftools loader
		helper.loadHeaderFixtures(path.resolve(__dirname, '..', 'fixtures', 'headers'), (err, res:helper.HeaderAssert[]) => {
			if (err) {
				return done(err);
			}
			try {
				assert.operator(res.length, '>', 0);
			}
			catch (e) {
				done(e);
			}
			data = res;

			if (filter) {
				data = _.filter(data, (value:helper.HeaderAssert) => {
					return filter.indexOf(value.name) > -1;
				});
			}
			done();
		});
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
			function testProp(def, data, parsed, prop) {
				assert.strictEqual(data[prop], parsed[prop], def.key + ' .' + prop);
			}

			_.each(data, (def:helper.HeaderAssert) => {
				assert.ok(def, def.key + ' ok');

				var data = new tsd.DefInfo();
				var parser = new tsd.DefInfoParser(false);
				parser.parse(data, def.header);

				var parsed = def.fields.parsed;
				if (def.fields.fields) {
					_.each(def.fields.fields, (field:string) => {
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

					assert.like(_.map(data.authors, (author) => {
						return author.toJSON();
					}), parsed['authors'], def.key + ' .' + 'authors');
				}
			});
		});
	});

});