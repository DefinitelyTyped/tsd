///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/git/GithubAPICached.ts" />
///<reference path="../../../../src/tsd/context/Context.ts" />

describe('git.GithubAPICached', () => {

	var api:git.GithubAPICached;

	var context:tsd.Context;
	var repo:git.GithubRepo;

	var path = require('path');
	var cacheDir;

	var testStat = (api:git.GithubAPICached, id:string, num:number, label?:string) => {
		assert.strictEqual(api.stats.get(id), num, label ? label + ':' + id : id);
	};

	before(() => {
		context = new tsd.Context();
		context.paths.cacheDir = path.resolve(__dirname, tsd.Const.cacheDir);
		cacheDir = path.join(context.paths.cacheDir, 'git_api');

		repo = new git.GithubRepo(context.config.repoOwner, context.config.repoProject);
	});
	after(() => {
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
	it('should be constructor', () => {
		api = new git.GithubAPICached(repo, cacheDir);
		assert.isObject(api, 'instance');
	});

	describe('getRepoParams', () => {
		it('should return user data', () => {
			assert.isObject(api, 'instance');

			var params = api.getRepoParams({extra: 123});
			assert.propertyVal(params, 'user', context.config.repoOwner);
			assert.propertyVal(params, 'repo', context.config.repoProject);
			assert.propertyVal(params, 'extra', 123, 'additional data');
		});
	});
	describe('getKey', () => {
		it('should return same key for same values', () => {
			assert.isObject(api, 'instance');

			var keys = ['aa', 'bb', 'cc'];
			assert.strictEqual(api.getKey('lbl', keys), api.getKey('lbl', keys), 'basic');
		});
	});
	describe('getBranches', () => {

		it('should not return data for bogus key', (done:() => void) => {
			api = new git.GithubAPICached(repo, cacheDir);
			//api.debug = true;

			api.getCachedRaw(api.getKey('bleh blah')).then((data) => {
				assert.notOk(data, 'callback data');
				done();
			}).done(null, done);
		});

		it('should cache and return data from store', (done:() => void) => {

			api = new git.GithubAPICached(repo, cacheDir);
			//api.debug = true;

			assert.isTrue(api.stats.hasAllZero(), 'pretest stats');

			api.getBranches().then((data) => {
				//xm.log('getBranches 1');

				assert.ok(data, 'callback data');

				testStat(api, 'invoked', 1, 'first');

				testStat(api, 'store-hit', 0, 'first');
				testStat(api, 'store-miss', 1, 'first');
				testStat(api, 'store-set', 1, 'first');

				// get again, should be cached
				return api.getBranches();
			}).then((data) => {
				//xm.log('getBranches 2');

				assert.ok(data, 'second callback data');

				testStat(api, 'invoked', 2, 'second');

				testStat(api, 'store-hit', 1, 'second');
				testStat(api, 'store-miss', 1, 'second');
				testStat(api, 'store-set', 1, 'second');
				done();
			}).done(null, done);
		});
	});
});