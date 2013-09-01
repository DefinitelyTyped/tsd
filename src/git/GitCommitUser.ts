module git {

	// simple committer from git itself
	//TODO rename? but to what?
	export class GitCommitUser {
		name:string;
		email:string;
		date:Date;

		toString():string {
			return (this.name ? this.name : '<no name>') + ' ' + (this.email ? '<' + this.email + '>' : '<no email>');
		}

		static fromJSON(json:any):GitCommitUser {
			if (!json) {
				return null;
			}
			var ret = new GitCommitUser();
			ret.name = json.name;
			ret.email = json.email;
			//TODO verifiy
			ret.date = new Date(Date.parse(json.date));
			return ret;
		}
	}
}