/// <reference path="../_ref.d.ts" />

'use strict';

import pointer = require('json-pointer');

import assert = require('../../xm/assert');
import assertVar = require('../../xm/assertVar');
import objectUtils = require('../../xm/objectUtils');

import GithubUser = require('../../git/model/GithubUser');
import GitCommitUser = require('../../git/model/GitCommitUser');
import GitCommitMessage = require('../../git/model/GitCommitMessage');

import defUtil = require('../util/defUtil');

/*
 DefCommit: meta-data for a single github commit
 */
class DefCommit {

	// NOTE for now lets not keep full git-trees per commit (DefinitelyTyped has too many commits) instead keep history per file

	commitSha: string;
	hasMeta: boolean = false;

	message: GitCommitMessage = new GitCommitMessage();

	hubAuthor: GithubUser;
	hubCommitter: GithubUser;

	gitAuthor: GitCommitUser;
	gitCommitter: GitCommitUser;

	// moar fields?

	constructor(commitSha: string) {
		assertVar(commitSha, 'sha1', 'commitSha');

		this.commitSha = commitSha;
		objectUtils.lockProps(this, ['commitSha']);
	}

	parseJSON(commit: any): void {
		assertVar(commit, 'object', 'commit');
		assert((commit.sha === this.commitSha), 'not my tree: {act}, {exp}', this.commitSha, commit.sha);

		this.hubAuthor = GithubUser.fromJSON(commit.author);
		this.hubCommitter = GithubUser.fromJSON(commit.committer);

		this.gitAuthor = GitCommitUser.fromJSON(commit.commit.author);
		this.gitCommitter = GitCommitUser.fromJSON(commit.commit.committer);

		this.message.parse(commit.commit.message);
		this.hasMeta = true;
	}

	hasMetaData(): boolean {
		return this.hasMeta;
	}

	toString(): string {
		return this.commitSha;
	}

	get changeDate(): Date {
		if (this.gitAuthor) {
			return this.gitAuthor.date;
		}
		if (this.gitCommitter) {
			return this.gitCommitter.date;
		}
		return null;
	}

	// human friendly
	get commitShort(): string {
		return this.commitSha ? defUtil.shaShort(this.commitSha) : '<no sha>';
	}
}

export = DefCommit;
