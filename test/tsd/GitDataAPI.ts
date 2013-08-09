///<reference path="../_ref.ts" />
///<reference path="../../src/tsd/GitDataAPI.ts" />
///<reference path="../../src/tsd/context/Context.ts" />

describe('git.GitCachedDataAPI', function () {

	var api:tsd.GitCachedDataAPI;
	var context:tsd.Context;

	it('should be defined', () => {
		assert.isFunction(tsd.GitCachedDataAPI, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			api = new tsd.GitCachedDataAPI(null);
		});
	});
	it('should be constructor', () => {
		context = new tsd.Context();
		api = new tsd.GitCachedDataAPI(context);
		assert.ok(api, 'instance');
	});
	describe('getUserParams', () => {
		it('should return user data', () => {
			var params = api.getUserParams({extra: 123});
			assert.propertyVal(params, 'user', context.config.repoOwner);
			assert.propertyVal(params, 'repo', context.config.repoProject);
			assert.propertyVal(params, 'extra', 123, 'additional data');
		});
	});
	describe('getKey', () => {
		it('should return same key for same values', () => {
			var keys = ['aa', 'bb', 'cc'];
			assert.strictEqual(api.getKey('lbl', keys), api.getKey('lbl', keys), 'basic');
		});
	});
	describe('getBranches', () => {
		it('should not be cached', () => {
			assert.isFalse(api.hasCached(api.getKey('getBranches')), 'not hasInCache');
		});

		it('should cache and return data', (done:(err?) => void) => {

			api.stats.zero();
			assert.strictEqual(api.stats.get('called'), 0, 'pretest');
			assert.strictEqual(api.stats.get('cache-hit'), 0, 'pretest');
			assert.strictEqual(api.stats.get('cache-miss'), 0, 'pretest');
			assert.strictEqual(api.stats.get('cache-set'), 0, 'pretest');

			// kill?
			assert.isTrue(api.stats.hasAllZeros(), 'pretest');

			var key = api.getBranches((err, data) => {
				if (err) {
					context.log.inspect(err);
				}
				assert.notOk(err, 'callback err');
				assert.ok(data, 'callback data');

				assert.isTrue(api.hasCached(key), 'hasInCache');

				assert.strictEqual(api.stats.get('called'), 1, 'cached');
				assert.strictEqual(api.stats.get('cache-hit'), 0, 'cache-hit');
				assert.strictEqual(api.stats.get('cache-miss'), 1, 'cache-miss');
				assert.strictEqual(api.stats.get('cache-set'), 1, 'cache-set');

				api.getBranches((err, data) => {
					if (err) {
						context.log.inspect(err);
					}
					assert.notOk(err, 'second callback err');
					assert.ok(data, 'second callback data');

					assert.isTrue(api.hasCached(key), ' second hasInCache');

					assert.strictEqual(api.stats.get('called'), 2, 'second cached');
					assert.strictEqual(api.stats.get('cache-hit'), 1, 'second cache-hit');
					assert.strictEqual(api.stats.get('cache-miss'), 1, 'second cache-miss');
					assert.strictEqual(api.stats.get('cache-set'), 1, 'second cache-set');

					done(err);
				});
			});
		});
	});
});
