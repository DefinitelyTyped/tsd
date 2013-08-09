///<reference path="context/Context.ts" />
///<reference path="../git/GitAPICached.ts" />
///<reference path="../git/GitUrls.ts" />

module tsd {

	var async:Async = require('async');

	export class Core {

		gitURL:git.GitURLs;
		gitAPI:git.GitAPICached;

		constructor(public context:tsd.Context) {
			this.gitURL = new git.GitURLs(context.config.repoOwner, context.config.repoProject);
			this.gitAPI = new git.GitAPICached(context.config.repoOwner, context.config.repoProject, context.paths.cache);
		}

		init(callback:(err) => void){

		}
	}
}