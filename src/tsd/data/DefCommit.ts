///<reference path="../_ref.ts" />
///<reference path="../../git/GithubJSON.ts" />
///<reference path="../../git/GithubUser.ts" />
///<reference path="../../git/GitCommitMessage.ts" />

module tsd {
	'use strict';

	var pointer = require('jsonpointer.js');
	var branch_tree_sha:string = '/commit/commit/tree/sha';

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
			xm.assertVar('commitSha', commitSha, 'string');

			this.commitSha = commitSha;

			xm.ObjectUtil.hidePrefixed(this);
			xm.ObjectUtil.lockProps(this, ['commitSha']);
		}

		parseJSON(commit:any):void {
			xm.assertVar('commit', commit, 'object');
			if (commit.sha !== this.commitSha) {
				throw new Error('not my tree: ' + this.commitSha + ' -> ' + commit.sha);
			}
			//TODO verify it is valid object
			if (this.treeSha) {
				throw new Error('allready got tree: ' + this.treeSha + ' -> ' + commit.sha);
			}

			this.treeSha = pointer.get(commit, branch_tree_sha);

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
			return this.treeSha;
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
