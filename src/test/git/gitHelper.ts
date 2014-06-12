/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
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
	baseDir: string;
	config: any;
	opts: JSONPointer;


	constructor() {
		this.baseDir = path.join(__dirname, '..', '..', '..');
		this.config = fileIO.readJSONSync(path.join(this.fixtureDir, 'config.json'));
		this.opts = new JSONPointer(fileIO.readJSONSync(path.join(path.dirname(PackageJSON.find()), 'conf', 'settings.json')));

		this.opts.setValue('git/api/allowClean', false);
		this.opts.setValue('git/raw/allowClean', false);

		this.opts.setValue('git/api/jobTimeout', 0);
		this.opts.setValue('git/raw/jobTimeout', 0);

		this.opts.setValue('git/api/splitKeyDir', 0);
		this.opts.setValue('git/raw/splitKeyDir', 0);
	}

	get cacheDir(): string {
		return path.join(this.baseDir, 'tmp', 'git-cache');
	}

	get fixtureDir(): string {
		return path.join(this.baseDir, 'fixtures');
	}

	get extraDir(): string {
		return path.join(this.baseDir, 'extra');
	}
}

export function getGitTestInfo(): GitTestInfo {
	return new GitTestInfo();
}
