///<reference path="../../_ref.d.ts" />
///<reference path="../../tsd/data/DefIndex.ts" />
///<reference path="SubCore.ts" />

module tsd {
	'use strict';

	var Q = require('q');
	var fs = require('fs');
	var path = require('path');
	var FS:typeof QioFS = require('q-io/fs');
	var pointer = require('json-pointer');

	export class ContentLoader extends tsd.SubCore {

		constructor(core:tsd.Core) {
			super(core, 'content', 'ContentLoader');
		}

		/*
		 lazy load a single DefCommit meta data
		 promise: DefCommit with meta data fields (authors, message etc)
		 */
		loadCommitMetaData(commit:tsd.DefCommit):Q.Promise<DefCommit> {
			var d:Q.Deferred<DefCommit> = Q.defer();
			this.track.promise(d.promise, 'commit_meta_load', commit.commitSha);

			if (commit.hasMetaData()) {
				d.resolve(commit);
				return;
			}
			this.core.repo.api.getCommit(commit.commitSha).then((json:any) => {
				commit.parseJSON(json);
				d.resolve(commit);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 lazy load a single DefVersion file content
		 promise: DefVersion; with raw .blob loaded
		 */
		loadContent(file:tsd.DefVersion):Q.Promise<DefVersion> {
			if (file.hasContent()) {
				this.track.skip('content_load', file.key);
				return Q(file);
			}

			var d:Q.Deferred<DefVersion> = Q.defer();
			this.track.promise(d.promise, 'content_load', file.key);

			this.core.index.getIndex().then((index:tsd.DefIndex) => {
				return this.core.repo.raw.getBinary(file.commit.commitSha, file.def.path).then((content:NodeBuffer) => {
					if (file.blob) {
						// race
						if (!file.blob.hasContent()) {
							try {
								file.blob.setContent(content);
							}
							catch (err) {
								xm.log.warn(err);
								xm.log.debug('path', file.def.path);
								xm.log.debug('commitSha', file.commit.commitSha);
								xm.log.debug('treeSha', file.commit.treeSha);
								xm.log.error('failed to set content');
								//throw new Error('failed to set content');
								throw err;
							}
						}
					}
					else {
						file.setContent(index.procureBlobFor(content));
					}
					d.resolve(file);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 bulk version of loadContent
		 promise: array: bulk results of single calls
		 */
		loadContentBulk(list:tsd.DefVersion[]):Q.Promise<DefVersion[]> {
			var d:Q.Deferred<DefVersion[]> = Q.defer();
			this.track.promise(d.promise, 'content_load_bulk');

			Q.all(list.map((file:DefVersion) => {
				return this.loadContent(file);
			})).then((list) => {
				d.resolve(list);
			}, d.reject);

			return d.promise;
		}

		/*
		 lazy load commit history meta data
		 promise: Def with .history filled with DefVersion
		 */
		loadHistory(def:tsd.Def):Q.Promise<Def> {
			var d:Q.Deferred<Def> = Q.defer();
			this.track.promise(d.promise, 'history_load', def.path);

			if (def.history.length > 0) {
				return Q(def);
			}
			this.core.index.getIndex().then((index:tsd.DefIndex) => {
				return this.core.repo.api.getPathCommits(this.core.context.config.ref, def.path).then((content:any[]) => {
					//this.log.inspect(content, null, 2);
					//TODO add pagination support (see github api docs)
					index.setHistory(def, content);
					d.resolve(def);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 bulk version of loadHistory()
		 promise: array: bulk results of single calls
		 */
		loadHistoryBulk(list:tsd.Def[]):Q.Promise<DefVersion[]> {
			var d:Q.Deferred<DefVersion[]> = Q.defer();
			this.track.promise(d.promise, 'history_load_bulk');

			list = tsd.DefUtil.uniqueDefs(list);

			Q.all(list.map((file:Def) => {
				return this.loadHistory(file);
			})).then((list) => {
				d.resolve(list);
			}, d.reject);

			return d.promise;
		}

	}
}
