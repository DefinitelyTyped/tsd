///<reference path='../../_ref.ts' />
///<reference path='../../../src/tsd/select/Selector.ts' />
///<reference path='../../../src/xm/io/hash.ts' />
///<reference path='../../../src/xm/io/FileUtil.ts' />

///<reference path='../../../src/tsd/data/Def.ts' />
///<reference path='../../../src/tsd/select/Selector.ts' />
///<reference path='../../../src/tsd/select/NameMatcher.ts' />

describe('Selector', () => {

	var list:tsd.Def[];


	before(() => {
		list = [];
		//dummy list
		var commit = xm.sha1('dummy!!');
		xm.FileUtil.readJSONSync('test/fixtures/paths-few.json').forEach((path) => {
			list.push(tsd.Def.getFrom(path));
		});
	});

	describe('basics', () => {
		it('is defined', () => {
			assert.ok(tsd.Selector, 'Selector');
			assert.ok(tsd.NameMatcher, 'NameMatcher');
		});
	});

	describe('NameMatcher', () => {
		var pattern:tsd.NameMatcher;
		var files:tsd.Def[];

		//TODO move all patterns and expected results to JSON and generate tests

		it('async 1', () => {
			pattern = new tsd.NameMatcher('async');
			assert.isObject(pattern, 'pattern');

			files = pattern.filter(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('async 2', () => {
			pattern = new tsd.NameMatcher('async/async');
			assert.isObject(pattern, 'pattern');

			files = pattern.filter(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('async 3', () => {
			pattern = new tsd.NameMatcher('async/*');
			assert.isObject(pattern, 'pattern');

			files = pattern.filter(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('jquery 2', () => {
			pattern = new tsd.NameMatcher('jquery/jquery');
			assert.isObject(pattern, 'pattern');

			files = pattern.filter(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('jquery 3', () => {
			pattern = new tsd.NameMatcher('jquery*/jquery*');
			assert.isObject(pattern, 'pattern');

			files = pattern.filter(list);

			//xm.log.inspect(files, '', 1);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 8, 'files');
		});
	});
});
