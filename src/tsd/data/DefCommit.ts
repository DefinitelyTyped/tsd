///<reference path="../_ref.ts" />
///<reference path="../../git/GithubJSON.ts" />
///<reference path="../../git/GithubUser.ts" />
///<reference path="../../git/GitCommitMessage.ts" />

module tsd {

	var pointer = require('jsonpointer.js');
	var branch_tree_sha:string = '/commit/commit/tree/sha';

	/*
	 DefCommit: meta-data for a single github commit
	 */
	export class DefCommit {

		//NOTE for now lets not keep full git-trees per commit (DefinitelyTyped has too many commits) instead keep history per file

		private _commitSha:string;
		private _treeSha:string;

		message:git.GitCommitMessage = new git.GitCommitMessage();

		hubAuthor:git.GithubUser;
		hubCommitter:git.GithubUser;

		gitAuthor:git.GitUserCommit;
		gitCommitter:git.GitUserCommit;

		//moar fields?

		constructor(commitSha:string) {
			xm.assertVar('commitSha', commitSha, 'string');

			this._commitSha = commitSha;
		}

		parseJSON(commit:any):void {
			xm.assertVar('commit', commit, 'object');
			if (commit.sha !== this._commitSha) {
				throw new Error('not my tree: ' + this._commitSha + ' -> ' + commit.sha);
			}

			this._treeSha = pointer.get(commit, branch_tree_sha);

			//TODO add a bit of checking? error? beh?
			this.hubAuthor = git.GithubUser.fromJSON(commit.author);
			this.hubCommitter = git.GithubUser.fromJSON(commit.committer);

			this.gitAuthor = git.GitUserCommit.fromJSON(commit.commit.author);
			this.gitCommitter = git.GitUserCommit.fromJSON(commit.commit.committer);

			this.message.parse(commit.commit.message);
		}

		toString():string {
			return this.commitShort;
		}

		get commitShort():string {
			return this._commitSha.substr(0, 8);
		}

		get commitSha():string {
			return this._commitSha;
		}
	}
}