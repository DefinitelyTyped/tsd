/// <reference path="../_ref.d.ts" />

'use strict';

import pointer = require('json-pointer');
import VError = require('verror');
import Promise = require('bluebird');
import Resolver = Promise.Resolver;

import collection = require('../../xm/collection');

import Options = require('../Options');
import Core = require('Core');
import CoreModule = require('./CoreModule');

import Def = require('../data/Def');
import DefVersion = require('../data/DefVersion');
import DefCommit = require('../data/DefCommit');
import DefIndex = require('../data/DefIndex');

var branch_tree: string = '/commit/commit/tree/sha';

class IndexManager extends CoreModule {

	private _promise: Promise<DefIndex> = null;

	constructor(core: Core) {
		super(core, 'index', 'IndexManager');
	}

	/*
	 lazy get or load the current DefIndex
	 */
	getIndex(): Promise<DefIndex> {
		if (this._promise) {
			return this._promise;
		}
		// keep a promise
		return this._promise = this.core.repo.api.getBranch(this.core.context.config.ref).then((branchData: any) => {
			if (!branchData) {
				throw new VError('loaded empty branch data');
			}
			var sha = pointer.get(branchData, branch_tree);
			if (!sha) {
				throw new VError('missing sha');
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
				throw new VError('cannot get def for path %s', path);
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
				throw new VError('cannot get file for path %s', path);
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
				throw new VError('cannot commit def for commitSha %s', commitSha);
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
