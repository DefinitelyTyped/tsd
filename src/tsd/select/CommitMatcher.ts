/// <reference path="../_ref.d.ts" />

'use strict';

import assert = require('../../xm/assert');

import DefVersion = require('../data/DefVersion');

var fullSha = /^[0-9a-f]{40}$/;
var hex = /^[0-9a-f]+$/;

/*
 CommitMatcher
 */
class CommitMatcher {

	commitSha: string;
	minimumShaLen: number = 2;

	constructor(commitSha?: string) {
		if (commitSha) {
			this.commitSha = String(commitSha).toLowerCase();
		}
	}

	filter(list: DefVersion[]): DefVersion[] {
		if (!this.commitSha) {
			return list;
		}
		return list.filter(this.getFilterFunc(this.commitSha));
	}

	getFilterFunc(commitSha: string): (file: DefVersion) => boolean {
		// safety first
		if (fullSha.test(commitSha)) {
			return (file: DefVersion) => {
				return (file.commit && file.commit.commitSha === commitSha);
			};
		}
		// alternately use shortened sha?
		assert(hex.test(commitSha), 'parameter not a hex {a}', commitSha);

		var len = commitSha.length;
		assert((len >= this.minimumShaLen), 'parameter hex too short: expected {e}, got {a}', this.minimumShaLen, len);

		return (file: DefVersion) => {
			return (file.commit && file.commit.commitSha.substr(0, len) === commitSha
			);
		};
	}
}

export = CommitMatcher;
