/// <reference path="../_ref.d.ts" />

'use strict';

import VError = require('verror');
import assertVar = require('../../xm/assertVar');

import tsdUtil = require('../util/tsdUtil');

import Def = require('./Def');
import DefCommit = require('./DefCommit');
import DefInfo = require('./DefInfo');

/*
 DefVersion: version of a definition (the file content in the repo)

 NOTE: for practical reasons linked to a commit (tree) instead of a blob
 */
// TODO rename DefVersion to DefRevision / DefRev
class DefVersion {
	// TODO swap for non-writable properties?
	private _def: Def = null;
	private _commit: DefCommit = null;

	// NOTE blobs are impractical to work with: api rate-limits and no access over raw.github
	private _blobSha: string = null;

	// parse from tags
	// TODO shouldn't this be DefVersion? from same commit? (still could easily get the head)
	dependencies: Def[] = [];
	solved: boolean = false;

	// parsed from header
	info: DefInfo;

	constructor(def: Def, commit: DefCommit) {
		assertVar(def, Def, 'def');
		assertVar(commit, DefCommit, 'commit');

		this._def = def;
		this._commit = commit;
	}

	setBlob(sha: string): void {
		assertVar(sha, 'sha1', 'blob');
		if (this._blobSha && this._blobSha !== sha) {
			throw new VError('already got a blob %s != %s', this._blobSha, sha);
		}
		this._blobSha = sha;
	}

	get key(): string {
		if (!this._def || !this._commit) {
			return null;
		}
		return this._def.path + '-' + this._commit.commitSha;
	}

	get def(): Def {
		return this._def;
	}

	get commit(): DefCommit {
		return this._commit;
	}

	get blobSha(): string {
		return this._blobSha;
	}

	// human friendly
	get blobShaShort(): string {
		return this._blobSha ? tsdUtil.shaShort(this._blobSha) : '<no sha>';
	}

	toString(): string {
		var str = '';
		str += (this._def ? this._def.path : '<no def>');
		str += ' : ' + (this._commit ? this._commit.commitShort : '<no commit>');
		str += ' : ' + (this._blobSha ? this.blobShaShort : '<no blob>');
		return str;
	}
}

export = DefVersion;
