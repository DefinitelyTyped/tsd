/// <reference path="../../_ref.d.ts" />

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;

import fileIO = require('../../xm/file/fileIO');
import helper = require('../../test/helper');

import PackageJSON = require('../../xm/data/PackageJSON');
import JSONPointer = require('../../xm/json/JSONPointer');
import GithubRepo = require('../../git/GithubRepo');

export class GitTestInfo {
	cacheDir = path.join(__dirname, '..', '..', '..', 'git-cache');
	fixtureDir = path.resolve(__dirname, '..', '..', '..', 'fixtures');
	config = fileIO.readJSONSync(path.join(this.fixtureDir, 'config.json'));
	extraDir = path.join(__dirname, '..', '..', '..', 'extra');
	opts = new JSONPointer(fileIO.readJSONSync(path.join(path.dirname(PackageJSON.find()), 'conf', 'settings.json')));

	constructor() {
		this.opts.setValue('git/api/allowClean', false);
		this.opts.setValue('git/raw/allowClean', false);

		this.opts.setValue('git/api/jobTimeout', 0);
		this.opts.setValue('git/raw/jobTimeout', 0);

		this.opts.setValue('git/api/splitKeyDir', 0);
		this.opts.setValue('git/raw/splitKeyDir', 0);
	}
}

export function getGitTestInfo(): GitTestInfo {
	return new GitTestInfo();
}

export function enableTrack(repo: GithubRepo) {
	// wtf
	/*repo.raw.track.setTrack(true);
	repo.raw.cache.track.setTrack(true);
	repo.raw.track.reset();
	repo.raw.cache.track.reset();
	repo.api.track.setTrack(true);
	repo.api.cache.track.setTrack(true);
	repo.api.track.reset();
	repo.api.cache.track.reset();*/
}
