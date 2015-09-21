/// <reference path="../_ref.d.ts" />

'use strict';

import pointer = require('json-pointer');
import Lazy = require('lazy.js');
import VError = require('verror');

import assertVar = require('../../xm/assertVar');
import objectUtils = require('../../xm/objectUtils');
import collection = require('../../xm/collection');

import Def = require('./Def');
import DefCommit = require('./DefCommit');
import DefUtil = require('./../util/defUtil');
import DefVersion = require('./DefVersion');

import gitUtil = require('../../git/gitUtil');
import GithubJSONTreeElem = require('../../git/model/GithubJSONTreeElem');

var commit_sha: string = '/commit/sha';
var branch_tree_sha: string = '/commit/commit/tree/sha';

/*
 DefIndex: holds the data for a repo branch in git

 for now loosely coupled to the github api version, might be possible to de-couple,
 at least from the format version (but not really worth it?)
 */
// TODO consider de-coupling with github api fomat or at least verify more
class DefIndex {

	private _branchName: string = null;
	private _hasIndex: boolean = false;
	private _indexCommit: DefCommit = null;

	private _definitions = new collection.Hash<Def>();
	private _commits = new collection.Hash<DefCommit>();
	private _versions = new collection.Hash<DefVersion>();

	constructor() {
		// hide from inspect()
	}

	hasIndex(): boolean {
		return this._hasIndex;
	}

	/*
	 init from branch (commit) and tree json, assumes recursive tree
	 */
	// TODO add more input data verification
	// TODO consider decoupling of github api data (low prio)
	init(branch: any, tree: any): void {
		assertVar(branch, 'object', 'branch');
		assertVar(tree, 'object', 'tree');

		if (this._hasIndex) {
			return;
		}

		this._commits.clear();
		this._versions.clear();
		this._definitions.clear();

		assertVar(branch, 'object', 'branch');
		assertVar(tree, 'object', 'tree');

		var commitSha = pointer.get(branch, commit_sha);
		var treeSha = tree.sha;
		var sha = pointer.get(branch, branch_tree_sha);

		assertVar(sha, 'string', 'sha');
		assertVar(treeSha, 'string', 'treeSha');
		assertVar(commitSha, 'string', 'commitSha');

		// verify tree is from branch (compare sha's)
		if (sha !== treeSha) {
			throw new VError('branch and tree sha mismatch');
		}

		this._branchName = branch.name;

		this._indexCommit = this.procureCommit(commitSha);
		this._indexCommit.parseJSON(branch.commit);

		var def: Def;
		var file: DefVersion;

		var releases: Def[] = [];

		(<any>Lazy(<Object>tree.tree)).each((elem: GithubJSONTreeElem) => {
			var char = elem.path.charAt(0);
			if (elem.type === 'blob' && char !== '.' && Def.isDefPath(elem.path)) {
				def = this.procureDef(elem.path);
				if (!def) {
					return;
				}

				file = this.procureVersion(def, this._indexCommit);
				if (!file) {
					return;
				}
				def.head = file;
				file.setBlob(elem.sha);

				if (def.isLegacy) {
					releases.push(def);
				}
			}
		});

		// collect release versions
		var defs = this._definitions.values();
		releases.forEach((legacy) => {
			defs.some((def) => {
				if (def.project === legacy.project && def.name === legacy.name && def.isLegacy === false) {
					def.releases.push(legacy);
					return true;
				}
			});
		});

		this._hasIndex = true;
	}

	/*
	 set the history of a single Def from json data
	 */
	setHistory(def: Def, commitJsonArray: any[]): void {
		assertVar(def, Def, 'def');
		assertVar(commitJsonArray, 'array', 'commits');

		// force reset for robustness
		def.history = [];

		// TODO harden data validation
		(<any>Lazy(commitJsonArray)).each((json) => {
			if (!json || !json.sha) {
				console.dir(json, 'weird: json no sha', 1);
			}
			var commit = this.procureCommit(json.sha);
			if (!commit) {
				console.dir('weird: no commit for sha ' + json.sha);
				throw new VError('huh?');
			}
			if (!commit.hasMeta) {
				commit.parseJSON(json);
			}
			def.history.push(this.procureVersion(def, commit));
		});
	}

	/*
	 get a DefCommit for a sha (enforces single instances)
	 */
	procureCommit(commitSha: string): DefCommit {
		assertVar(commitSha, 'sha1', 'commitSha');

		var commit: DefCommit;
		if (this._commits.has(commitSha)) {
			commit = this._commits.get(commitSha);
		}
		else {
			commit = new DefCommit(commitSha);
			this._commits.set(commitSha, commit);
		}
		return commit;
	}

	/*
	 get a Def for a path (enforces single instances)
	 */
	procureDef(path: string): Def {
		assertVar(path, 'string', 'path');

		var def: Def = null;

		if (this._definitions.has(path)) {
			def = this._definitions.get(path);
		}
		else {
			def = new Def(path);
			if (!def) {
				throw new VError('cannot parse path to def %s', path);
			}
			this._definitions.set(path, def);
		}
		return def;
	}

	/*
	 get a DefVersion for a Def + DefCommit combination (enforces single instances)
	 */
	procureVersion(def: Def, commit: DefCommit): DefVersion {
		assertVar(def, Def, 'def');
		assertVar(commit, DefCommit, 'commit');

		var file: DefVersion;

		var key = def.path + '|' + commit.commitSha;

		if (this._versions.has(key)) {
			file = this._versions.get(key);
			// NOTE: should not happen but keep robust
			if (file.def !== def) {
				throw new VError('weird: internal data mismatch: version does not belong to file %s -> %s', file.def, commit);
			}
		}
		else {
			file = new DefVersion(def, commit);
			this._versions.set(key, file);
		}
		return file;
	}

	/*
	 attempt to get a DefVersion (and its Def and DefCommit) for a path + commitSha combination (enforces single instances)
	 */
	procureVersionFromSha(path: string, commitSha: string): DefVersion {
		assertVar(path, 'string', 'path');
		assertVar(commitSha, 'sha1', 'commitSha');

		var def = this.getDef(path);
		if (!def) {
			console.log('path not in index, attempt-adding: ' + path);

			// attempt creation
			def = this.procureDef(path);
		}
		if (!def) {
			throw new VError('cannot procure definition for %s', path);
		}

		var commit = this.procureCommit(commitSha);
		if (!commit) {
			throw new VError('cannot procure commit for %s -> %s', path, commitSha);
		}
		if (!commit.hasMetaData()) {
			// TODO always load meta data? meh? waste of requests?
		}
		var file = this.procureVersion(def, commit);
		if (!file) {
			throw new VError('cannot procure definition version for %s -> %s', path, commit.commitSha);
		}
		// need to look it up

		return file;
	}

	getDef(path: string): Def {
		return this._definitions.get(path);
	}

	hasDef(path: string): boolean {
		return this._definitions.has(path);
	}

	getCommit(sha: string): DefCommit {
		return this._commits.get(sha);
	}

	hasCommit(sha: string): boolean {
		return this._commits.has(sha);
	}

	getPaths(): string[] {
		return this._definitions.values().map((file: Def) => {
			return file.path;
		});
	}

	toDump(): string {
		var ret: string[] = [];
		ret.push(this.toString());
		this._definitions.forEach((def: Def) => {
			ret.push('  ' + def.toString());
			// ret.push('  ' + def.head.toString());
			/*if (def.history) {
			 def.history.forEach((file:DefVersion) => {
			 ret.push('    - ' + file.toString());
			 });
			 }*/
		});
		return ret.join('\n') + '\n' + 'total ' + this._definitions.size + ' definitions';
	}

	get branchName(): string {
		return this._branchName;
	}

	get list(): Def[] {
		return this._definitions.values();
	}

	get indexCommit(): DefCommit {
		return this._indexCommit;
	}

	toString(): string {
		return '[' + this._branchName + ']';
	}
}

export = DefIndex;
