///<reference path="../../_ref.ts" />
///<reference path="../../../src/git/GithubURLManager.ts" />

describe('git.GitURLs', () => {

	var urls:git.GithubURLManager;

	it('should be defined', () => {
		assert.isFunction(git.GithubURLManager, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			urls = new git.GithubURLManager(null);
		});
	});
	it('should be constructor', () => {
		urls = new git.GithubRepo('foo', 'bar').urls;
		assert.ok(urls, 'instance');
	});
	describe('direct', () => {
		it('should return replaced urls', () => {
			var api = 'https://api.github.com/repos/foo/bar';
			var raw = 'https://raw.github.com/foo/bar';
			var base = 'https://github.com/foo/bar';
			var rawFile = raw + '/af12345/sub/folder/file.txt';
			assert.strictEqual(urls.api(), api, 'api');
			assert.strictEqual(urls.base(), base, 'base');
			assert.strictEqual(urls.rawFile('af12345', 'sub/folder/file.txt'), rawFile, 'rawFile');
		});
	});
});
