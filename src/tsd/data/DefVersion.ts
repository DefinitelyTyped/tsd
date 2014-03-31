/// <reference path="../_ref.d.ts" />

'use strict';

import assertVar = require('../../xm/assertVar');
import objectUtils = require('../../xm/objectUtils');

import Def = require('./Def');
import DefBlob = require('./DefBlob');
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
	private _blob: DefBlob = null;

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

	setContent(blob: DefBlob): void {
		assertVar(blob, DefBlob, 'blob');
		if (this._blob) {
			throw new Error('already got a blob: ' + this._blob.sha + ' != ' + blob.sha);
		}
		this._blob = blob;
	}

	hasContent(): boolean {
		return (this._blob && this._blob.hasContent());
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

	get blob(): DefBlob {
		return this._blob;
	}

	// human friendly
	get blobShaShort(): string {
		return this._blob ? this._blob.shaShort : '<no blob>';
	}

	toString(): string {
		var str = '';
		str += (this._def ? this._def.path : '<no def>');
		str += ' : ' + (this._commit ? this._commit.commitShort : '<no commit>');
		str += ' : ' + (this._blob ? this._blob.shaShort : '<no blob>');
		return str;
	}
}

export = DefVersion;
