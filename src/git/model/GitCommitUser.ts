module git {
	'use strict';

	/*
	 GitCommitUser: basic git committer
	  */
	export class GitUserCommit {
		name:string;
		email:string;
		date:Date;

		toString():string {
			return (this.name ? this.name : '<no name>') + ' ' + (this.email ? '<' + this.email + '>' : '<no email>');
		}

		static fromJSON(json:any):git.GitUserCommit {
			if (!json) {
				return null;
			}

			xm.assertVar(json.name, 'string', ' json.name');
			xm.assertVar(json.email, 'string', ' json.email');

			//TODO verify json data
			var ret = new git.GitUserCommit();
			ret.name = json.name;
			ret.email = json.email;
			ret.date = new Date(Date.parse(json.date));
			return ret;
		}
	}
}
