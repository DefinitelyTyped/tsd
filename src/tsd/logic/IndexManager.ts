/// <reference path="../../_ref.d.ts" />
/// <reference path="../../tsd/data/DefIndex.ts" />
/// <reference path="SubCore.ts" />

module tsd {
	'use strict';

	var Q = require('q');
	var pointer = require('json-pointer');

	var branch_tree:string = '/commit/commit/tree/sha';

	export class IndexManager extends tsd.SubCore {

		static init:string = 'init';
		static tree_get:string = 'tree_get';
		static branch_get:string = 'branch_get';

		static procure_def:string = 'procure_def';
		static procure_file:string = 'procure_file';
		static procure_commit:string = 'procure_commit';

		private _defer = new Map<string, Q.Deferred<tsd.DefIndex>>();

		constructor(core:tsd.Core) {
			super(core, 'index', 'IndexManager');
		}

		/*
		 lazy get or load the current DefIndex
		 promise: DefIndex: with a git-tree loaded and parsed for Defs (likely always the same)
		 */
		getIndex():Q.Promise<tsd.DefIndex> {
			var refKey = this.core.context.config.repoRef;
			var defer:Q.Deferred<tsd.DefIndex> = this._defer[refKey];

			if (defer) {
				this.track.skip(IndexManager.init);
				// TODO fix progress properly and remove hack
				// lame bypass notify
				var d:Q.Deferred<tsd.DefIndex> = Q.defer();
				defer.promise.then(d.resolve, d.reject);
				return defer.promise;
			}
			var index = new tsd.DefIndex();

			defer = Q.defer();
			this._defer[refKey] = defer;

			this.track.promise(defer.promise, IndexManager.init, refKey);
			this.track.start(IndexManager.branch_get);

			this.core.repo.api.getBranch(this.core.context.config.ref).progress(defer.notify).then((branchData:any) => {
				this.track.complete(IndexManager.branch_get);

				if (!branchData) {
					throw new Error('loaded empty branch data');
				}
				var sha = pointer.get(branchData, branch_tree);
				if (!sha) {
					throw new Error('missing sha');
				}
				this.track.start(IndexManager.tree_get);

				return this.core.repo.api.getTree(sha, true).progress(defer.notify).then((data:any) => {
					this.track.complete(IndexManager.tree_get);

					index.init(branchData, data);

					this.track.complete(IndexManager.init);
					defer.resolve(index);
				});
			}).fail((err) => {
					this.track.failure(IndexManager.init, err.message, err);
					defer.reject(err);
				}).done();

			return defer.promise;
		}

		/*
		 procure a Def instance for a path
		 promise: Def: either fresh or with existing data
		 */
		procureDef(path:string):Q.Promise<Def> {
			var d:Q.Deferred<Def> = Q.defer();

			this.getIndex().progress(d.notify).then((index:tsd.DefIndex) => {
				var def:tsd.Def = index.procureDef(path);
				if (!def) {
					throw new Error('cannot get def for path: ' + path);
				}
				d.resolve(def);
			}).fail(d.reject).done();

			return d.promise;
		}

		/*
		 procure a DefVersion instance for a path and commit
		 promise: DefVersion: either fresh or with existing data
		 */
		procureFile(path:string, commitSha:string):Q.Promise<DefVersion> {
			var d:Q.Deferred<DefVersion> = Q.defer();

			this.getIndex().progress(d.notify).then((index:tsd.DefIndex) => {
				var file:tsd.DefVersion = index.procureVersionFromSha(path, commitSha);
				if (!file) {
					throw new Error('cannot get file for path: ' + path);
				}
				d.resolve(file);
			}).fail(d.reject).done();

			return d.promise;
		}

		/*
		 procure a DefCommit instance for a commit sha
		 promise: DefCommit: either fresh or with existing data
		 */
		procureCommit(commitSha:string):Q.Promise<DefCommit> {
			var d:Q.Deferred<DefCommit> = Q.defer();

			this.getIndex().progress(d.notify).then((index:tsd.DefIndex) => {
				var commit:tsd.DefCommit = index.procureCommit(commitSha);
				if (!commit) {
					throw new Error('cannot commit def for commitSha: ' + commitSha);
				}
				d.resolve(commit);
			}).fail(d.reject).done();


			return d.promise;
		}

		/*
		 find a DefVersion based on its path and a partial commit sha
		 promise: DefVersion
		 */
		findFile(path:string, commitShaFragment:string):Q.Promise<DefVersion> {
			var d:Q.Deferred<DefVersion> = Q.defer();
			// TODO implement partial commitSha lookup (github api does thi btu how do we track it?)
			// TODO cache Tree if searching (when querying against many commits)
			d.reject('implement me!');
			return d.promise;
		}

	}
}
