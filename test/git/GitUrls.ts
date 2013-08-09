///<reference path="../_ref.ts" />
///<reference path="../../src/git/GitUrls.ts" />

describe('git.GitURLs', function () {

	var urls:git.GitURLs;

	it('should be defined', () => {
		assert.isFunction(git.GitURLs, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			urls = new git.GitURLs('foo', null);
		});
		assert.throws(() => {
			urls = new git.GitURLs(null, null);
		});
	});
	it('should be constructor', () => {
		urls = new git.GitURLs('foo', 'bar');
		assert.ok(urls, 'instance');
	});
	describe('direct', () => {
		it('should return replaced urls', () => {
			var api = 'https://api.github.com/repos/foo/bar';
			var base = 'https://github.com/foo/bar';
			var rawFile = base + '/raw/sub/folder/file.txt';
			assert.strictEqual(urls.api(), api, 'api');
			assert.strictEqual(urls.base(), base, 'base');
			assert.strictEqual(urls.rawFile('sub/folder/file.txt'), rawFile, 'rawFile');
		});
	});
});
