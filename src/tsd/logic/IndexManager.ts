/// <reference path="../_ref.d.ts" />

'use strict';

import pointer = require('json-pointer');
import Promise = require('bluebird');
import Resolver = Promise.Resolver;

import Options = require('../Options');
import Core = require('Core');
import SubCore = require('./SubCore');

import Def = require('../data/Def');
import DefVersion = require('../data/DefVersion');
import DefCommit = require('../data/DefCommit');
import DefIndex = require('../data/DefIndex');

var branch_tree: string = '/commit/commit/tree/sha';

class IndexManager extends SubCore {

	static init: string = 'init';
	static tree_get: string = 'tree_get';
	static branch_get: string = 'branch_get';

	static procure_def: string = 'procure_def';
	static procure_file: string = 'procure_file';
	static procure_commit: string = 'procure_commit';

	private _defer = new Map<string, Promise<DefIndex>>();

	constructor(core: Core) {
		super(core, 'index', 'IndexManager');
	}

	/*
	 lazy get or load the current DefIndex
	 */
	getIndex(): Promise<DefIndex> {
		var refKey = this.core.context.config.repoRef;
		if (this._defer.has(refKey)) {
			return this._defer.get(refKey);
		}

		return this._defer[refKey] = this.core.repo.api.getBranch(this.core.context.config.ref).then((branchData: any) => {
			if (!branchData) {
				throw new Error('loaded empty branch data');
			}
			var sha = pointer.get(branchData, branch_tree);
			if (!sha) {
				throw new Error('missing sha');
			}
			return this.core.repo.api.getTree(sha, true).then((data: any) => {
				var index = new DefIndex();
				index.init(branchData, data);
				return index;
			});
		});
	}

	/*
	 procure a Def instance for a path
	 */
	procureDef(path: string): Promise<Def> {
		return this.getIndex().then((index: DefIndex) => {
			var def: Def = index.procureDef(path);
			if (!def) {
				throw new Error('cannot get def for path: ' + path);
			}
			return def;
		});
	}

	/*
	 procure a DefVersion instance for a path and commit
	 */
	procureFile(path: string, commitSha: string): Promise<DefVersion> {
		return this.getIndex().then((index: DefIndex) => {
			var file: DefVersion = index.procureVersionFromSha(path, commitSha);
			if (!file) {
				throw new Error('cannot get file for path: ' + path);
			}
			return file;
		});
	}

	/*
	 procure a DefCommit instance for a commit sha
	 */
	procureCommit(commitSha: string): Promise<DefCommit> {
		return this.getIndex().then((index: DefIndex) => {
			var commit: DefCommit = index.procureCommit(commitSha);
			if (!commit) {
				throw new Error('cannot commit def for commitSha: ' + commitSha);
			}
			return commit;
		});
	}

	/*
	 find a DefVersion based on its path and a partial commit sha
	 */
	findFile(path: string, commitShaFragment: string): Promise<DefVersion> {
		// TODO implement partial commitSha lookup (github api does thi btu how do we track it?)
		// TODO cache Tree if searching (when querying against many commits)
		return Promise.reject(new Error('implement me!'));
	}
}

export = IndexManager;
