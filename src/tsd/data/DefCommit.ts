///<reference path="../_ref.ts" />
///<reference path="../../git/model/GithubJSON.ts" />
///<reference path="../../git/model/GithubUser.ts" />
///<reference path="../../git/model/GitCommitMessage.ts" />

module tsd {
	'use strict';

	var pointer = require('json-pointer');

	/*
	 DefCommit: meta-data for a single github commit
	 */
	export class DefCommit {

		//NOTE for now lets not keep full git-trees per commit (DefinitelyTyped has too many commits) instead keep history per file

		commitSha:string;
		hasMeta:boolean = false;

		message:git.GitCommitMessage = new git.GitCommitMessage();

		hubAuthor:git.GithubUser;
		hubCommitter:git.GithubUser;

		gitAuthor:git.GitUserCommit;
		gitCommitter:git.GitUserCommit;

		//moar fields?

		constructor(commitSha:string) {
			xm.assertVar(commitSha, 'sha1', 'commitSha');

			this.commitSha = commitSha;

			xm.ObjectUtil.hidePrefixed(this);
			xm.ObjectUtil.lockProps(this, ['commitSha']);
		}

		parseJSON(commit:any):void {
			xm.assertVar(commit, 'object', 'commit');
			xm.assert((commit.sha === this.commitSha), 'not my tree: {act}, {exp}', this.commitSha, commit.sha);

			//TODO add a bit of checking? error? beh?
			this.hubAuthor = git.GithubUser.fromJSON(commit.author);
			this.hubCommitter = git.GithubUser.fromJSON(commit.committer);

			this.gitAuthor = git.GitUserCommit.fromJSON(commit.commit.author);
			this.gitCommitter = git.GitUserCommit.fromJSON(commit.commit.committer);

			this.message.parse(commit.commit.message);
			this.hasMeta = true;

			xm.ObjectUtil.lockProps(this, ['commitSha', 'hasMeta']);
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
