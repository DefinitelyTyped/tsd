/// <reference path="../_ref.d.ts" />

import assertVar = require('../../xm/assertVar');

import DefVersion = require('../data/DefVersion');
import DefCommit = require('../data/DefCommit');

/*
 InstalledDef: single installed file in Config
 */
class InstalledDef {

	path: string;
	commitSha: string;

	constructor(path: string) {
		if (path) {
			assertVar(path, 'string', 'path');
			this.path = path;
		}
	}

	update(file: DefVersion) {
		assertVar(file, DefVersion, 'file');

		assertVar(file.commit, DefCommit, 'commit');
		assertVar(file.commit.commitSha, 'sha1', 'commit.sha');

		this.path = file.def.path;
		this.commitSha = file.commit.commitSha;
	}

	toString(): string {
		return this.path;
	}
}

export = InstalledDef;
