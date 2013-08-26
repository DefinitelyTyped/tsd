///<reference path='../../_ref.ts' />

///<reference path='../../../src/tsd/data/Selector.ts' />
///<reference path='../../../src/xm/io/hash.ts' />
///<reference path='../../../src/xm/io/FileUtil.ts' />

describe('Selector', () => {

	var list:tsd.DefFile[];

	function addFile(name) {
		list.push(tsd.DefFile.getFrom(name, xm.sha1(name)));
	}

	before(() => {
		list = [];
		xm.FileUtil.readJSONSync('test/fixtures/paths-few.json').forEach((path) => {
			addFile(path);
		});
	});

	describe('basics', () => {
		it('is defined', () => {
			assert.ok(tsd.Selector, 'Selector');
			assert.ok(tsd.SelectorFilePattern, 'SelectorFilePattern');
		});
	});

	describe('SelectorFilePattern', () => {
		var pattern:tsd.SelectorFilePattern;
		var files:tsd.DefFile[];

		it('async 1', () => {
			pattern = new tsd.SelectorFilePattern('async/async');
			assert.isObject(pattern, 'pattern');

			files = pattern.matchTo(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('async 2', () => {
			pattern = new tsd.SelectorFilePattern('async/*');
			assert.isObject(pattern, 'pattern');

			files = pattern.matchTo(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('jquery 1', () => {
			pattern = new tsd.SelectorFilePattern('jquery/jquery');
			assert.isObject(pattern, 'pattern');

			files = pattern.matchTo(list);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 1, 'files');
		});

		it('jquery 2', () => {
			pattern = new tsd.SelectorFilePattern('jquery*/jquery*');
			assert.isObject(pattern, 'pattern');

			files = pattern.matchTo(list);

			//xm.log.inspect(files, '', 1);

			assert.isArray(files, 'files');
			assert.lengthOf(files, 8, 'files');
		});
	});
});
