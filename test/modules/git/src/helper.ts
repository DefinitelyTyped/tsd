///<reference path="../../../../src/xm/io/FileUtil.ts" />
module gitTest {
	'use strict';

	var path = require('path');

	export var cacheDir = path.join(__dirname, 'git-cache');
	export var fixtureDir = path.resolve(__dirname, '..', 'fixtures');
	export var config = xm.FileUtil.readJSONSync(path.join(fixtureDir, 'config.json'));
}
//TODO find out why this is needed
declare var gitTest;
