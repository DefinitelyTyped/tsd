///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/tsd/logic/Core.ts" />
///<reference path="../../../../src/tsd/select/Selector.ts" />

describe('Core', () => {

	var fs = require('fs');
	var path = require('path');

	var _:UnderscoreStatic = <UnderscoreStatic>require('underscore');

	var core:tsd.Core;
	var context:tsd.Context;


	before(() => {
	});
	beforeEach(() => {
		context = helper.getContext();
		context.config.log.mute = true;
		context.paths.configFile = './test/fixtures/config/valid.json';
	});

	it('should be defined', () => {
		assert.isFunction(tsd.Core, 'constructor');
	});
	it('should throw on bad params', () => {
		assert.throws(() => {
			core = new tsd.Core(null);
		});
	});
	it('should be constructor', () => {
		core = new tsd.Core(context);
		assert.isObject(core, 'constructor');
	});
	describe('readConfig', () => {
		it('should pass on missing optional data', () => {
			context.paths.configFile = './non-existing/tsd-config.json';
			core = new tsd.Core(context);
			return assert.isFulfilled(core.readConfig(true));
		});
		it('should fail on missing required data', () => {
			context.paths.configFile = './non-existing/tsd-config.json';
			core = new tsd.Core(context);
			return assert.isRejected(core.readConfig(false), /^cannot locate file:/);
		});
		it('should fail on missing typingsPath value', () => {
			context.paths.configFile = './test/fixtures/config/missing-typingsPath.json';
			core = new tsd.Core(context);
			return assert.isRejected(core.readConfig(false), /^malformed config:/);
		});
		it('should fail on bad version value', () => {
			context.paths.configFile = './test/fixtures/config/invalid-version.json';
			core = new tsd.Core(context);
			return assert.isRejected(core.readConfig(false), /^malformed config:/);
		});
		it('should load config data', () => {
			context.paths.configFile = './test/fixtures/config/valid-alt.json';
			var source = xm.FileUtil.readJSONSync(context.paths.configFile);

			core = new tsd.Core(context);
			return core.readConfig(false).then(() => {
				helper.assertConfig(core.context.config, source, 'source data');
			});
		});
	});
	describe('saveConfig', () => {
		it('should save modified data', () => {
			//copy temp for saving
			var saveFile = path.resolve(__dirname, 'save-config.json');
			fs.writeFileSync(saveFile, fs.readFileSync('./test/fixtures/config/valid.json', {encoding: 'utf8'}), {encoding: 'utf8'});

			context.paths.configFile = saveFile;
			core = new tsd.Core(context);
			core.log.mute = true;

			var source = xm.FileUtil.readJSONSync(saveFile);
			var changed = xm.FileUtil.readJSONSync(saveFile);
			changed.typingsPath = 'some/other/path';
			changed.installed['bleh/blah.d.ts'] = changed.installed['async/async.d.ts'];
			delete changed.installed['async/async.d.ts'];

			return core.readConfig(false).then(() => {
				helper.assertConfig(core.context.config, source, 'core.context.config');

				core.context.config.typingsPath = 'some/other/path';
				core.context.config.getInstalled()[0].path = 'bleh/blah.d.ts';

				return core.saveConfig();
			}).then(() => {
				return xm.FileUtil.readJSONPromise(context.paths.configFile);
			}).then((json) => {
				helper.assertConfig(core.context.config, changed, 'saved data');
			});
		});
	});

	describe('getIndex', () => {
		it('should return data', () => {
			core = new tsd.Core(context);
			return assert.isFulfilled(core.getIndex().then(() => {
				assert.operator(core.index.list.length, '>', 200, 'definitions.list');
				//xm.log(core.index.toDump());
				//TODO validate index data
				return null;
			}));
		});
	});
});
