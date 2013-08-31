///<reference path='../../_ref.ts' />

///<reference path='../../../src/tsd/data/Selector.ts' />
///<reference path='../../../src/xm/io/hash.ts' />
///<reference path='../../../src/xm/io/FileUtil.ts' />

describe('Selector', () => {

	var list:tsd.Definition[];


	before(() => {
		list = [];
		//dummy list
		var commit = xm.sha1('dummy!!');
		xm.FileUtil.readJSONSync('test/fixtures/paths-few.json').forEach((path) => {
			list.push(tsd.Definition.getFrom(path, xm.sha1(path), commit));
		});
	});

	describe('basics', () => {
		it('is defined', () => {
			assert.ok(tsd.Selector, 'Selector');
			assert.ok(tsd.SelectorPattern, 'SelectorFilePattern');
		});
	});

	describe('SelectorFilePattern', () => {
		var pattern:tsd.SelectorPattern;
		var files:tsd.Definition[];

		it('async 1', () => {
			pattern = new tsd.SelectorPattern('async');
			assert.isObject(pattern, 'pattern');

			files = pattern.matchTo(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('async 2', () => {
			pattern = new tsd.SelectorPattern('async/async');
			assert.isObject(pattern, 'pattern');

			files = pattern.matchTo(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('async 3', () => {
			pattern = new tsd.SelectorPattern('async/*');
			assert.isObject(pattern, 'pattern');

			files = pattern.matchTo(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('jquery 2', () => {
			pattern = new tsd.SelectorPattern('jquery/jquery');
			assert.isObject(pattern, 'pattern');

			files = pattern.matchTo(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('jquery 3', () => {
			pattern = new tsd.SelectorPattern('jquery*/jquery*');
			assert.isObject(pattern, 'pattern');

			files = pattern.matchTo(list);

			//xm.log.inspect(files, '', 1);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 8, 'files');
		});
	});
});
