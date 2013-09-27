///<reference path="../../../../src/xm/io/FileUtil.ts" />
///<reference path="../../../assert/xm/StatCounter.ts" />

module helper {
	'use strict';

	var path = require('path');

	export class GitTestInfo {
		cacheDir = path.join(__dirname, 'git-cache');
		fixtureDir = path.resolve(__dirname, '..', 'fixtures');
		config = xm.FileUtil.readJSONSync(path.join(this.fixtureDir, 'config.json'));
		extraDir = path.join(__dirname, 'extra');
	}
	export function getGitTestInfo():GitTestInfo {
		return new GitTestInfo();
	}
}
