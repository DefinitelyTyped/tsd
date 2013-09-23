///<reference path="../../../_ref.ts" />
///<reference path="../../../tsdHelper.ts" />

///<reference path="../../../../src/tsd/context/Config.ts" />

describe('Config', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	var config:tsd.Config;

	beforeEach(() => {
		config = new tsd.Config(helper.configSchema);
		config.log.mute = true;
	});
	afterEach(() => {
		config = null;
	});

	it('is instance', () => {
		assert.isObject(config);
	});
	var valid = [
		'default',
		'valid',
		'valid-alt',
		'valid-minimal',
	];
	var invalid = [
		['missing-typingsPath', /^malformed config:/],
		['path-bad-chars', /^malformed config:/],
		['path-no-project', /^malformed config:/],
		['path-no-type', /^malformed config:/]
	];
	valid.forEach((name) => {
		it('parses "' + name + '"', () => {
			var json = xm.FileUtil.readJSONSync('./test/fixtures/config/' + name + '.json');

			config.parseJSON(json);
			helper.assertConfig(config, json, name);
		});
	});
	invalid.forEach((tuple) => {
		it('rejects "' + tuple[0] + '"', () => {
			assert.lengthOf(tuple, 2, 'tuple');

			var json = xm.FileUtil.readJSONSync('./test/fixtures/config/' + tuple[0] + '.json');
			assert.throws(() => {
				//xm.log(json);
				config.parseJSON(json);
			}, tuple[1]);
		});
	});
});
