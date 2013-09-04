///<reference path="../../_ref.ts" />
///<reference path="../../../src/git/GithubRawCached.ts" />
///<reference path="../../../src/tsd/context/Context.ts" />

describe('git.GithubRawCached', () => {

	var raw:git.GithubRawCached;

	var context:tsd.Context;
	var repo:git.GithubRepo;

	var path = require('path');
	var cacheDir;
	var testStat = (raw:git.GithubRawCached, id:string, num:number, label?:string) => {
		assert.strictEqual(raw.stats.get(id), num, label ? label + ':' + id : id);
	};

	before(() => {
		context = new tsd.Context();
		context.paths.cacheDir = path.resolve(__dirname, tsd.Const.cacheDir);

		cacheDir = path.join(context.paths.cacheDir, 'git_raw');

		repo = new git.GithubRepo(context.config.repoOwner, context.config.repoProject);
	});

	it('should be defined', () => {
		assert.isFunction(git.GithubRawCached, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			raw = new git.GithubRawCached(null, null);
		});
	});
	it('should be constructor', () => {
		raw = new git.GithubRawCached(repo, cacheDir);
		assert.isObject(raw, 'instance');
	});

	describe('getFile', () => {

		var filePath = 'async/async.d.ts';
		var commitSha = '1eab71a53a7df593305bd9b8b27cb752cc045417';

		it('should cache and return data', (done:() => void) => {
			this.timeout(15000);

			raw = new git.GithubRawCached(repo, cacheDir);
			raw.debug = true;

			assert.isTrue(raw.stats.hasAllZero(), 'pretest stats');

			raw.getFile(commitSha, filePath).then((data) => {
				xm.log('getFile 1');

				assert.ok(data, 'callback data');

				testStat(raw, 'invoked', 1, 'first');
				testStat(raw, 'store-hit', 0, 'first');
				testStat(raw, 'store-miss', 1, 'first');
				testStat(raw, 'store-set', 1, 'first');

				// get again, should be cached
				return raw.getFile(commitSha, filePath);
			},(err) => {
				xm.log.error(err);
				assert(false, 'error: ' + err);
			}).then((data) => {
				xm.log('getFile 2');

				assert.ok(data, 'second callback data');

				testStat(raw, 'invoked', 2, 'second');
				testStat(raw, 'store-hit', 1, 'second');
				testStat(raw, 'store-miss', 1, 'second');
				testStat(raw, 'store-set', 1, 'second');

			},(err) => {
				xm.log.error(err);
				assert(false, 'error: ' + err);
			}).fin(() => {
				done();
			}).done();
		});
	});
});