/// <reference path="../../../../src/xm/file.ts" />
/// <reference path="../../../../src/xm/data/PackageJSON.ts" />
/// <reference path="../../../../src/xm/json-pointer.ts" />
/// <reference path="../../../../src/git/GithubRepo.ts" />

module helper {
	'use strict';

	var path = require('path');

	export class GitTestInfo {
		cacheDir = path.join(__dirname, 'git-cache');
		fixtureDir = path.resolve(__dirname, '..', 'fixtures');
		config = xm.file.readJSONSync(path.join(this.fixtureDir, 'config.json'));
		extraDir = path.join(__dirname, 'extra');
		opts = new xm.JSONPointer(xm.file.readJSONSync(path.join(path.dirname(xm.PackageJSON.find()), 'conf', 'settings.json'))).getChild('git');

		constructor() {
			this.opts.setValue('api/allowClean', false);
			this.opts.setValue('raw/allowClean', false);

			this.opts.setValue('api/jobTimeout', 0);
			this.opts.setValue('raw/jobTimeout', 0);

			this.opts.setValue('api/splitKeyDir', 0);
			this.opts.setValue('raw/splitKeyDir', 0);
		}
	}

	export function getGitTestInfo():GitTestInfo {
		return new GitTestInfo();
	}

	export function enableTrack(repo:git.GithubRepo) {
		// wtf
		repo.raw.track.setTrack(true);
		repo.raw.cache.track.setTrack(true);
		repo.raw.track.reset();
		repo.raw.cache.track.reset();
		repo.api.track.setTrack(true);
		repo.api.cache.track.setTrack(true);
		repo.api.track.reset();
		repo.api.cache.track.reset();
	}
}
