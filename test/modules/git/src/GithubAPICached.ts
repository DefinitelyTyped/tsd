///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/git/GithubAPICached.ts" />
///<reference path="../../../../src/tsd/context/Context.ts" />

describe('git.GithubAPICached', () => {

	var api:git.GithubAPICached;

	var context:tsd.Context;
	var repo:git.GithubRepo;

	var path = require('path');
	var cacheDir;

	beforeEach(() => {
		context = new tsd.Context();
		//use clean tmp folder in this test module
		context.paths.cacheDir = path.join(__dirname, tsd.Const.cacheDir);
		cacheDir = path.join(context.paths.cacheDir, 'git_api');

		repo = new git.GithubRepo(context.config.repoOwner, context.config.repoProject);
		api = new git.GithubAPICached(repo, cacheDir);
	});
	afterEach(() => {
		context = null;
		repo = null;
		api = null;
	});

	it('should be defined', () => {
		assert.isFunction(git.GithubAPICached, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			api = new git.GithubAPICached(null, null);
		});
	});
	it('should have default options', () => {
		assert.isTrue(api.loader.options.cacheRead, 'options.cacheRead');
		assert.isTrue(api.loader.options.cacheWrite, 'options.cacheWrite');
		assert.isTrue(api.loader.options.remoteRead, 'options.remoteRead');
	});

	describe('mergeParams', () => {
		it('should return user data', () => {
			var params = api.mergeParams({extra: 123});
			assert.propertyVal(params, 'user', context.config.repoOwner);
			assert.propertyVal(params, 'repo', context.config.repoProject);
			assert.propertyVal(params, 'extra', 123, 'additional data');
		});
	});
	describe('getKey', () => {
		it('should return same key for same values', () => {
			var keys = ['aa', 'bb', 'cc'];
			assert.strictEqual(api.loader.getKey('lbl', keys), api.loader.getKey('lbl', keys), 'basic');
		});
	});
	describe('getBranches', () => {

		it('should not return data for bogus key', () => {
			//api.debug = true;

			assert.isTrue(api.loader.stats.hasAllZero(), 'pretest stats');

			return api.service.getCachedRaw(api.loader.getKey('bleh blah')).then((data) => {
				assert.notOk(data, 'callback data');

				//xm.log(api.loader.stats.stats.export());
				assert.isTrue(api.loader.stats.hasAllZero(), 'stats');
			});
		});

		it('should cache and return data from store', () => {

			api = new git.GithubAPICached(repo, cacheDir);
			//api.debug = true;

			assert.isTrue(api.loader.stats.hasAllZero(), 'pretest stats');

			return api.getBranches().then((data) => {
				assert.ok(data, 'callback data');

				//xm.log(api.loader.stats.stats.export());
				helper.assertStatCounter(api.loader.stats, {
					start: 1,
					'read-start': 1,
					'active-set': 1,
					'read-miss': 1,
					'load-start': 1,
					'load-success': 1,
					'write-start': 1,
					'write-success': 1,
					'active-remove': 1,
					complete: 1
				}, 'first');

				assert.isArray(data, 'data');

				// get again, should be cached
				return api.getBranches();
			}).then((data) => {
				assert.ok(data, 'second callback data');

				//xm.log(api.loader.stats.stats.export());
				helper.assertStatCounter(api.loader.stats, {
					start: 2,
					'read-start': 2,
					'active-set': 2,
					'read-miss': 1,
					'load-start': 1,
					'load-success': 1,
					'write-start': 1,
					'write-success': 1,
					'active-remove': 2,
					complete: 2,
					'read-hit': 1,
					'cache-hit': 1
				}, 'second');

				assert.isArray(data, 'data');
			});
		});
	});
});