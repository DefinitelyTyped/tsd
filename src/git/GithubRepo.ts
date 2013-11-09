///<reference path="../xm/assertVar.ts" />
///<reference path="GithubURLs.ts" />
///<reference path="loader/GithubAPI.ts" />
///<reference path="loader/GithubRaw.ts" />

module git {
	'use strict';

	/*
	 GithubRepo: basic github repo info
	 */
	//TODO consider merging api and raw instances to this? maybe bundle in a new class?
	//TODO Object.freeze or make getters of props?
	export class GithubRepo {

		ownerName:string;
		projectName:string;
		storeDir:string;

		urls:git.GithubURLs;
		api:git.GithubAPI;
		raw:git.GithubRaw;

		constructor(ownerName:string, projectName:string, storeDir:string) {
			xm.assertVar(ownerName, 'string', 'ownerName');
			xm.assertVar(projectName, 'string', 'projectName');
			xm.assertVar(storeDir, 'string', 'storeDir');

			this.ownerName = ownerName;
			this.projectName = projectName;
			this.storeDir = storeDir;

			this.urls = new git.GithubURLs(this);
			this.api = new git.GithubAPI(this, path.join(this.storeDir, 'git-api'));
			this.raw = new git.GithubRaw(this,  path.join(this.storeDir, 'git-raw'));

			xm.ObjectUtil.lockProps(this, Object.keys(this));
		}

		getCacheKey():string {
			return this.ownerName + '-' + this.projectName;
		}

		toString():string {
			return this.ownerName + '/' + this.projectName;
		}
	}
}
