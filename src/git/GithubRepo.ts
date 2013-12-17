/// <reference path="../xm/assertVar.ts" />
/// <reference path="GithubURLs.ts" />
/// <reference path="loader/GithubAPI.ts" />
/// <reference path="loader/GithubRaw.ts" />
/// <reference path="./GithubRepoConfig.d.ts" />

module git {
	'use strict';

	var path = require('path');

	/*
	 GithubRepo: basic github repo info
	 */
	export class GithubRepo {

		config:GithubRepoConfig;
		storeDir:string;

		urls:git.GithubURLs;
		api:git.GithubAPI;
		raw:git.GithubRaw;


		constructor(config:GithubRepoConfig, storeDir:string) {
			xm.assertVar(config, 'object', 'config');
			xm.assertVar(storeDir, 'string', 'storeDir');

			this.config = config;

			this.storeDir =  path.join(storeDir.replace(/[\\\/]+$/, ''), this.getCacheKey());

			this.urls = new git.GithubURLs(this);

			this.api = new git.GithubAPI(this, this.storeDir);
			this.raw = new git.GithubRaw(this, this.storeDir);

			xm.object.lockProps(this, Object.keys(this));
		}

		getCacheKey():string {
			return this.config.repoOwner + '-' + this.config.repoProject;
		}

		toString():string {
			return this.config.repoOwner + '/' + this.config.repoProject;
		}

		set verbose(verbose:boolean) {
			this.api.verbose = verbose;
			this.raw.verbose = verbose;
		}
	}
}
