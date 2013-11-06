///<reference path="../_ref.ts" />
///<reference path="../../git/GithubJSON.ts" />
///<reference path="../../git/GithubUser.ts" />
///<reference path="../../git/GitCommitMessage.ts" />

module tsd {
	'use strict';

	var pointer = require('jsonpointer.js');

	/*
	 DefCommit: meta-data for a single github commit
	 */
	export class DefCommit {

		//NOTE for now lets not keep full git-trees per commit (DefinitelyTyped has too many commits) instead keep history per file

		commitSha:string;
		treeSha:string;
		hasMeta:boolean = false;

		message:git.GitCommitMessage = new git.GitCommitMessage();

		hubAuthor:git.GithubUser;
		hubCommitter:git.GithubUser;

		gitAuthor:git.GitUserCommit;
		gitCommitter:git.GitUserCommit;

		//moar fields?

		constructor(commitSha:string) {
			xm.assertVar(commitSha, 'string', 'commitSha');

			this.commitSha = commitSha;

			xm.ObjectUtil.hidePrefixed(this);
			xm.ObjectUtil.lockProps(this, ['commitSha']);
		}

		parseJSON(commit:any):void {
			xm.assertVar(commit, 'object', 'commit');
			xm.log('parseJSON');
			if (commit.sha !== this.commitSha + 'xxx') {
				xm.throwAssert('not my tree: {act}, {exp}', this.commitSha, commit.sha);
			}
			//TODO verify it is valid object
			if (this.treeSha) {
				throw new Error('allready got tree: ' + this.treeSha + ' -> ' + commit.sha);
			}

			this.treeSha = pointer.get(commit, '/commit/tree/sha');
			xm.assertVar(this.treeSha, 'sha1', 'treeSha');

			//TODO add a bit of checking? error? beh?
			this.hubAuthor = git.GithubUser.fromJSON(commit.author);
			this.hubCommitter = git.GithubUser.fromJSON(commit.committer);

			this.gitAuthor = git.GitUserCommit.fromJSON(commit.commit.author);
			this.gitCommitter = git.GitUserCommit.fromJSON(commit.commit.committer);

			this.message.parse(commit.commit.message);
			this.hasMeta = true;

			xm.ObjectUtil.lockProps(this, ['treeSha', 'hasMeta']);
		}

		hasMetaData():boolean {
			return this.hasMeta;
		}

		toString():string {
			return this.commitSha;
		}

		//TODO verify ths order is optimal
		get changeDate():Date {
			if (this.gitAuthor) {
				return this.gitAuthor.date;
			}
			if (this.gitCommitter) {
				return this.gitCommitter.date;
			}
			return null;
		}

		//human friendly
		get commitShort():string {
			return this.commitSha ? tsd.shaShort(this.commitSha) : '<no sha>';
		}
	}
}
