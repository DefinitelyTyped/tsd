///<reference path="../_ref.ts" />
///<reference path="../../src/git/urls.ts" />

describe('git.GitAPIUrls', function () {

	var urls:git.GitAPIUrls;
	var expected;
	var actual;
	var api = 'https://api.github.com/repos';
	var base = api + '/foo/bar';

	it('should be defined', () => {
		assert.isFunction(git.GitAPIUrls, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			urls = new git.GitAPIUrls('foo', null);
		});
		assert.throws(() => {
			urls = new git.GitAPIUrls(null, null);
		});
	});
	it('should be constructor', () => {
		urls = new git.GitAPIUrls('foo', 'bar');
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
