/// <reference path="../_ref.d.ts" />

import assertVar = require('../../xm/assertVar');

/*
 GitCommitUser: basic git committer
  */
class GitCommitUser {
	name: string;
	email: string;
	date: Date;

	toString(): string {
		return (this.name ? this.name : '<no name>') + ' ' + (this.email ? '<' + this.email + '>' : '<no email>');
	}

	static fromJSON(json: any): GitCommitUser {
		if (!json) {
			return null;
		}

		assertVar(json.name, 'string', ' json.name');
		assertVar(json.email, 'string', ' json.email');

		// TODO verify json data
		var ret = new GitCommitUser();
		ret.name = json.name;
		ret.email = json.email;
		ret.date = new Date(Date.parse(json.date));
		return ret;
	}
}

export = GitCommitUser;
