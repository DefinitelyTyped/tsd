/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import pointer = require('json-pointer');
import Promise = require('bluebird');
import LRU = require('lru-cache');
import VError = require('verror');

import assert = require('../../xm/assert');

import Def = require('../data/Def');
import DefBlob = require('../data/DefBlob');
import DefVersion = require('../data/DefVersion');
import DefCommit = require('../data/DefCommit');
import DefIndex = require('../data/DefIndex');
import defUtil = require('../util/defUtil');
import gitUtil = require('../../git/gitUtil');

import Options = require('../Options');
import Core = require('./Core');
import CoreModule = require('./CoreModule');

class ContentLoader extends CoreModule {

	private cache: LRU.Cache<Buffer>;

	constructor(core: Core) {
		super(core, 'ContentLoader');

		this.cache = LRU<Buffer>({
			stale: true,
			max: 10 * 1024 * 1024,
			maxAge: 1000 * 60,
			length: (buffer) => {
				return buffer.length;
			}
		});
	}

	/*
	 lazy load a single DefCommit meta data
	 */
	loadCommitMetaData(commit: DefCommit): Promise<DefCommit> {
		if (commit.hasMetaData()) {
			return Promise.resolve(commit);
		}
		return this.core.repo.api.getCommit(commit.commitSha).then((json: any) => {
			commit.parseJSON(json);
			return commit;
		});
	}

	/*
	 lazy load a single DefVersion file content
	 */
	loadContent(file: DefVersion, tryHead: boolean = true): Promise<DefBlob> {
		if (file.blobSha && this.cache.has(file.blobSha)) {
			return Promise.resolve(new DefBlob(file, this.cache.get(file.blobSha)));
		}
		var ref = file.commit.commitSha;
		// re-cycle head
		if (tryHead && file.def.head && file.commit.commitSha === file.def.head.commit.commitSha) {
			ref = this.core.context.config.ref;
		}
		return this.core.repo.raw.getBinary(ref, file.def.path).then((content: Buffer) => {
			var sha: string = gitUtil.blobShaHex(content);
			if (file.blobSha) {
				if (sha !== file.blobSha) {
					throw new VError('bad blob sha1 for %s, expected %s, got %s', file.def.path, file.blobSha, sha);
				}
			}
			else {
				file.setBlob(sha);
			}
			this.cache.set(sha, content);

			return new DefBlob(file, content);
		});
	}

	/*
	 bulk version of loadContent
	 */
	loadContentBulk(list: DefVersion[]): Promise<DefBlob[]> {
		return Promise.map(list, (file: DefVersion) => {
			return this.loadContent(file);
		});
	}

	/*
	 lazy load commit history meta data
	 */
	loadHistory(def: Def): Promise<Def> {
		if (def.history.length > 0) {
			return Promise.resolve(def);
		}
		return Promise.all([
			this.core.index.getIndex(),
			this.core.repo.api.getPathCommits(def.path)
		]).spread((index: DefIndex, content: any[]) => {
			// this.console.dir(content, null, 2);
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
