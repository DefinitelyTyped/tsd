///<reference path="../xm/assertVar.ts" />
///<reference path="GithubURLManager.ts" />

module git {

	export class GithubRepo {

		urls:git.GithubURLManager;

		constructor(public ownerName:string, public projectName:string) {
			xm.assertVar('ownerName', ownerName, 'string');
			xm.assertVar('projectName', projectName, 'string');

			this.urls = new git.GithubURLManager(this);
		}

		getCacheKey():string {
			return this.ownerName + '-' + this.projectName;
		}

		toString():string {
			return this.ownerName + '/' + this.projectName;
		}
	}
}
