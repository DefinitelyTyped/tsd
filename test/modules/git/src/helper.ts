/// <reference path="../../../../src/xm/file/file.ts" />
/// <reference path="../../../../src/xm/data/PackageJSON.ts" />
/// <reference path="../../../../src/xm/json/json-pointer.ts" />
/// <reference path="../../../../src/git/GithubRepo.ts" />

module helper {
	'use strict';

	var path = require('path');

	export class GitTestInfo {
		cacheDir = path.join(__dirname, 'git-cache');
		fixtureDir = path.resolve(__dirname, '..', 'fixtures');
		config = fileIO.readJSONSync(path.join(this.fixtureDir, 'config.json'));
		extraDir = path.join(__dirname, 'extra');
		opts = new xm.JSONPointer(xm.file.readJSONSync(path.join(path.dirname(xm.PackageJSON.find()), 'conf', 'settings.json')));

		constructor() {
			this.opts.setValue('git/api/allowClean', false);
			this.opts.setValue('git/raw/allowClean', false);

			this.opts.setValue('git/api/jobTimeout', 0);
			this.opts.setValue('git/raw/jobTimeout', 0);

			this.opts.setValue('git/api/splitKeyDir', 0);
			this.opts.setValue('git/raw/splitKeyDir', 0);
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
