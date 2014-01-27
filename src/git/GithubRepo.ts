/// <reference path="../xm/assertVar.ts" />
/// <reference path="../xm/json-pointer.ts" />
/// <reference path="GithubURLs.ts" />
/// <reference path="GithubRepoConfig.ts" />
/// <reference path="loader/GithubAPI.ts" />
/// <reference path="loader/GithubRaw.ts" />

module git {
	'use strict';

	var path = require('path');

	/*
	 GithubRepo: basic github repo info
	 */
	export class GithubRepo {

		config:git.GithubRepoConfig;
		storeDir:string;

		urls:git.GithubURLs;
		api:git.GithubAPI;
		raw:git.GithubRaw;

		constructor(config:git.GithubRepoConfig, storeDir:string, opts:xm.JSONPointer) {
			xm.assertVar(config, 'object', 'config');
			xm.assertVar(storeDir, 'string', 'storeDir');
			xm.assertVar(opts, xm.JSONPointer, 'opts');

			this.config = config;
			this.urls = new git.GithubURLs(this);

			this.storeDir = path.join(storeDir.replace(/[\\\/]+$/, ''), this.getCacheKey());

			this.api = new git.GithubAPI(this, opts.getChild('api'), this.storeDir);
			this.raw = new git.GithubRaw(this, opts.getChild('raw'), this.storeDir);

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
