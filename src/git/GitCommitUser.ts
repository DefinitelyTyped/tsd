module git {

	/*
	 GitCommitUser: basic git committer
	  */
	//TODO rename class? but to what?
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
			//TODO verify json data
			var ret = new git.GitUserCommit();
			ret.name = json.name;
			ret.email = json.email;
			ret.date = new Date(Date.parse(json.date));
			return ret;
		}
	}
}