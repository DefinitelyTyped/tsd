/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');
import path = require('path');
import pointer = require('json-pointer');
import Promise = require('bluebird');

import log = require('../../xm/log');

import Def = require('../data/Def');
import DefVersion = require('../data/DefVersion');
import DefCommit = require('../data/DefCommit');
import DefIndex = require('../data/DefIndex');
import defUtil = require('../util/defUtil');

import Options = require('../Options');
import Core = require('Core');
import SubCore = require('./SubCore');

class ContentLoader extends SubCore {

	constructor(core: Core) {
		super(core, 'content', 'ContentLoader');
	}

	/*
	 lazy load a single DefCommit meta data
	 */
	loadCommitMetaData(commit: DefCommit): Promise<DefCommit> {
		if (commit.hasMetaData()) {
			return Promise.cast(commit);
		}
		return this.core.repo.api.getCommit(commit.commitSha).then((json: any) => {
			commit.parseJSON(json);
			return commit;
		});
	}

	/*
	 lazy load a single DefVersion file content
	 */
	// TODO this should not keep the content in memory
	loadContent(file: DefVersion, tryHead: boolean = false): Promise<DefVersion> {
		if (file.hasContent()) {
			return Promise.cast(file);
		}
		return this.core.index.getIndex().then((index: DefIndex) => {
			var ref = file.commit.commitSha;
			// re-cycle head
			if (tryHead && file.commit.commitSha === file.def.head.commit.commitSha) {
				ref = this.core.context.config.ref;
			}
			return this.core.repo.raw.getBinary(ref, file.def.path).then((content: NodeBuffer) => {
				if (file.blob && !file.blob.hasContent()) {
					try {
						file.blob.setContent(content);
					}
					catch (err) {
						log.warn(err);
						log.debug('path', file.def.path);
						log.debug('commitSha', file.commit.commitSha);
						log.error('failed to set content');
						// throw new Error('failed to set content');
						throw err;
					}
				}
				else {
					file.setContent(index.procureBlobFor(content));
				}
			});
		}).return(file);
	}

	/*
	 bulk version of loadContent
	 */
	loadContentBulk(list: DefVersion[]): Promise<DefVersion[]> {
		return Promise.map(list, (file: DefVersion) => {
			return this.loadContent(file);
		});
	}

	/*
	 lazy load commit history meta data
	 */
	loadHistory(def: Def): Promise<Def> {
		if (def.history.length > 0) {
			return Promise.cast(def);
		}
		return Promise.all([
			this.core.index.getIndex(),
			this.core.repo.api.getPathCommits(def.path)
		]).spread((index: DefIndex, content: any[]) => {
			// this.log.inspect(content, null, 2);
			// TODO add pagination support (see github api docs)
			index.setHistory(def, content);
		}).return(def);
	}

	/*
	 bulk version of loadHistory()
	 */
	loadHistoryBulk(list: Def[]): Promise<Def[]> {
		list = defUtil.uniqueDefs(list);
		return Promise.map(list, (file: Def) => {
			return this.loadHistory(file);
		});
	}
}

export = ContentLoader;
