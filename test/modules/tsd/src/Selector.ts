///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/tsd/select/Selector.ts" />
///<reference path="../../../../src/xm/io/hash.ts" />
///<reference path="../../../../src/xm/io/FileUtil.ts" />

///<reference path="../../../../src/tsd/data/Def.ts" />
///<reference path="../../../../src/tsd/select/Selector.ts" />
///<reference path="../../../../src/tsd/select/NameMatcher.ts" />

describe('Selector', () => {

	var path = require('path');

	describe('basics', () => {
		it('is defined', () => {
			assert.ok(tsd.Selector, 'Selector');
			assert.ok(tsd.NameMatcher, 'NameMatcher');
		});
	});

	describe('NameMatcher', () => {
		var list:tsd.Def[];

		var pattern:tsd.NameMatcher;
		var files:tsd.Def[];

		var select:any;
		select = require(path.resolve(__dirname, '..', 'fixtures', 'nameMatcher'));
		assert.ok(select.data, 'select.data');
		assert.ok(select.source, 'select.source');

		before(() => {
			//dummy list
			list = [];
			select.source.forEach((path) => {
				list.push(tsd.Def.getFrom(path));
			});
		});
		after(() => {
			list = null;
			pattern = null;
			files = null;
			select = null;
		});
		select.data.forEach((data) => {
			it('match "' + String(data.pattern) + '"', () => {
				pattern = new tsd.NameMatcher(data.pattern);
				assert.isObject(pattern, 'pattern');

				var paths = pattern.filter(list).map((def:tsd.Def) => {
					return def.path;
				});

				assert.isArray(paths, 'paths');
				assert.lengthOf(paths, data.result.length, 'paths');
				assert.like(paths, data.result, 'paths');
			});
		});
	});
});
