///<reference path="../../_ref.ts" />
///<reference path="../../../src/git/GitAPICached.ts" />
///<reference path="../../../src/tsd/context/Context.ts" />

describe.skip('git.GitAPICached', function () {

	var api:git.GitAPICached;
	var context:tsd.Context;

	var tmpDir = './test/tmp/GitAPICached';

	var testStat = (api:git.GitAPICached, id:string, num:number, label?:string) => {
		assert.strictEqual(api.stats.get(id), num, label ? label + ':' + id : id);
	};

	before(() => {
		context = new tsd.Context();
	});

	it('should be defined', () => {
		assert.isFunction(git.GitAPICached, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			api = new git.GitAPICached(null, null, null);
		});
	});
	it('should be constructor', () => {
		api = new git.GitAPICached(context.config.repoOwner, context.config.repoProject, tmpDir);
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

		it('should not be cached', (done:(err?) => void) => {
			assert.isObject(api, 'instance');

			api.getCachedRaw(api.getKey('bleh blah'), (err, data) => {
				if (err) {
					xm.log.inspect(err);
				}
				assert.notOk(err, 'callback err');
				assert.notOk(data, 'callback data');

				done();
			});
		});

		it('should cache and return data', (done:(err?) => void) => {

			api = new git.GitAPICached(context.config.repoOwner, context.config.repoProject, tmpDir);
			//api.stats.log = true;

			assert.isTrue(api.stats.hasAllZero(), 'pretest stats');

			var key = api.getBranches((err, data) => {
				if (err) {
					xm.log.inspect(err);
				}
				assert.notOk(err, 'callback err');
				assert.ok(data, 'callback data');
				assert.isString(key, 'key');

				testStat(api, 'called', 1, 'first');

				testStat(api, 'cache-hit', 0, 'first');
				testStat(api, 'cache-miss', 1, 'first');
				testStat(api, 'cache-set', 1, 'first');

				testStat(api, 'store-hit', 0, 'first');
				testStat(api, 'store-miss', 1, 'first');
				testStat(api, 'store-set', 1, 'first');

				// should be in cache
				api.getCachedRaw(key, (err, data) => {
					if (err) {
						xm.log.inspect(err);
					}
					assert.notOk(err, 'getCachedRaw err');
					assert.ok(data, 'getCachedRaw data');

					// get again, should be cached
					var key2 = api.getBranches((err, data) => {
						if (err) {
							xm.log.inspect(err);
						}
						assert.notOk(err, 'second callback err');
						assert.ok(data, 'second callback data');

						assert.strictEqual(key, key2, 'identical keys');

						testStat(api, 'called', 2, 'second');
						testStat(api, 'cache-hit', 1, 'second');
						testStat(api, 'cache-miss', 1, 'second');
						testStat(api, 'cache-set', 1, 'second');

						testStat(api, 'store-hit', 0, 'second');
						testStat(api, 'store-miss', 1, 'second');
						testStat(api, 'store-set', 1, 'second');

						// should still be in cache
						api.getCachedRaw(key2, (err, data) => {
							if (err) {
								xm.log.inspect(err);
							}
							assert.notOk(err, 'second getCachedRaw err');
							assert.ok(data, 'second getCachedRaw data');
							done(err);
						});
					});
				});
			});
		});

		it('should return data from store', (done:(err?) => void) => {
			api = new git.GitAPICached(context.config.repoOwner, context.config.repoProject, tmpDir);
			//api.stats.log = true;

			assert.isTrue(api.stats.hasAllZero(), 'pretest stats');

			api.getBranches((err, data) => {
				if (err) {
					xm.log.inspect(err);
				}
				assert.notOk(err, 'callback err');
				assert.ok(data, 'callback data');

				testStat(api, 'called', 1);

				testStat(api, 'cache-hit', 0);
				testStat(api, 'cache-miss', 1);
				testStat(api, 'cache-set', 0);

				testStat(api, 'store-hit', 1);
				testStat(api, 'store-miss', 0);
				testStat(api, 'store-set', 0);

				done();
			});
		});
	});
});
