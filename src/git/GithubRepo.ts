///<reference path="../xm/assertVar.ts" />
///<reference path="GithubURLs.ts" />
///<reference path="loader/GithubAPI.ts" />
///<reference path="loader/GithubRaw.ts" />

module git {
	'use strict';

	var path = require('path');

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
			this.storeDir =  path.join(storeDir.replace(/[\\\/]+$/, ''), this.getCacheKey());

			this.urls = new git.GithubURLs(this);

			this.api = new git.GithubAPI(this, this.storeDir);
			this.raw = new git.GithubRaw(this, this.storeDir);

			xm.ObjectUtil.lockProps(this, Object.keys(this));
		}

		getCacheKey():string {
			return this.ownerName + '-' + this.projectName;
		}

		toString():string {
			return this.ownerName + '/' + this.projectName;
		}

		set verbose(verbose:boolean) {
			this.api.verbose = verbose;
			this.raw.verbose = verbose;
		}
	}
}
