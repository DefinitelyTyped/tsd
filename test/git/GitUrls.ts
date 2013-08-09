///<reference path="../_ref.ts" />
///<reference path="../../src/git/GitUrls.ts" />

describe('git.GitUrls', function () {

	var urls:git.GitUrls;
	var api = 'https://api.github.com/repos';
	var base = api + '/foo/bar';

	it('should be defined', () => {
		assert.isFunction(git.GitUrls, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			urls = new git.GitUrls('foo', null);
		});
		assert.throws(() => {
			urls = new git.GitUrls(null, null);
		});
	});
	it('should be constructor', () => {
		urls = new git.GitUrls('foo', 'bar');
		assert.ok(urls, 'instance');
	});
	describe('direct', () => {
		it('should return replaced urls', () => {
			assert.strictEqual(urls.branchHeadList(), base + '/git/refs/heads', 'branchHeadList');
			assert.strictEqual(urls.branchHead('master'), base + '/git/refs/heads/master', 'branchHead');
			assert.strictEqual(urls.commit('abcdef'), base + '/git/commits/abcdef', 'commit');
			assert.strictEqual(urls.tree('abcdef'), base + '/git/trees/abcdef', 'commit');
		});
	});
});
