///<reference path="../git/GitAPICached.ts" />
///<reference path="../git/GitUrls.ts" />
///<reference path="../git/GitUrls.ts" />
///<reference path="../xm/callAsync.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="context/Context.ts" />
///<reference path="API.ts" />

module tsd {

	var async:Async = require('async');
	var assert = require('assert');
	var path = require('path');

	export class APICore {

		gitURL:git.GitURLs;
		gitAPI:git.GitAPICached;

		constructor(public context:tsd.Context) {
			xm.assertVar('context', context, tsd.Context);

			this.gitURL = new git.GitURLs(
				context.config.repoOwner,
				context.config.repoProject
			);
			this.gitAPI = new git.GitAPICached(
				context.config.repoOwner,
				context.config.repoProject,
				path.join(context.paths.cache, 'git')
			);
		}

		getIndex(callback:(err, index) => void) {
			var self:APICore = this;

			self.gitAPI.getBranch(this.context.config.ref, (err:any, index:any) => {
				if (err) {
					return callback(err, null);
				}
				return callback(null, index);
			});
		}

		select(selector:Selector, options:APIOptions, callback:(err, selection:Def[]) => void) {
			var self:APICore = this;

			self.getIndex((err, index) => {
				if (err) {
					return callback(err, null);
				}

				//apply selector

				callback(null, null);
			});
		}
	}
}