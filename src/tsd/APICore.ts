///<reference path="../git/GithubAPICached.ts" />
///<reference path="../git/GithubURLManager.ts" />
///<reference path="../git/GithubRawFile.ts" />
///<reference path="../xm/callAsync.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="data/Decoder.ts" />
///<reference path="context/Context.ts" />
///<reference path="data/Definition.ts" />
///<reference path="API.ts" />

module tsd {

	var async:Async = require('async');
	var assert = require('assert');
	var path = require('path');
	var pointer = require('jsonpointer.js');

	var branch_tree:string = '/commit/commit/tree/sha';

	export class APIOptions {
		constructor() {

		}
	}

	export class APIResult {

		error:string;
		patternMatch:DefFile[];

		constructor(public operation:string, public selector:Selector, public options?:APIOptions) {
			xm.assertVar('operation', operation, 'string');
			xm.assertVar('selector', selector, Selector);
		}
	}

	export class APISelection {
		constructor() {

		}
	}

	export class APICore {

		gitRepo:git.GithubRepo;
		gitURL:git.GithubURLManager;
		gitAPI:git.GithubAPICached;
		gitRaw:git.GithubRawFile;
		definitions:tsd.DefinitionData;

		constructor(public context:tsd.Context) {
			xm.assertVar('context', context, tsd.Context);

			this.definitions = new tsd.DefinitionData();

			this.gitRepo = new git.GithubRepo(
				context.config.repoOwner,
				context.config.repoProject
			);

			this.gitURL = new git.GithubURLManager(this.gitRepo);
			this.gitAPI = new git.GithubAPICached(this.gitRepo,
				path.join(context.paths.cache, 'git')
			);
			this.gitRaw = new git.GithubRawFile(this.gitURL);
		}

		getIndex(callback:(err) => void) {
			var self:APICore = this;

			if (this.definitions.hasBranch()) {
				xm.callAsync(callback, null);
				return;
			}

			self.gitAPI.getBranch(this.context.config.ref, (err:any, branchData:any) => {
				if (err) {
					return callback(err);
				}

				var sha = pointer.get(branchData, branch_tree);
				if (!sha) {
					return callback('missing sha hash');
				}

				self.gitAPI.getTree(sha, true, (err:any, data:any) => {
					if (err) {
						return callback(err);
					}

					//xm.log(data);

					self.definitions.setBranch(branchData, data);

					return callback(null);
				});
			});
		}

		select(selector:Selector, options:APIOptions, callback:(err, result:APIResult) => void) {
			var self:APICore = this;

			var result = new APIResult('select', selector, options);

			self.getIndex((err) => {
				if (err) {
					return callback(err, null);
				}

				result.patternMatch = selector.pattern.matchTo(self.definitions.list);

				var tasks = {};

				//TODO fix crude filter
				/*if (selector.requiresHistory) {
				 if (result.patternMatch.length > 1) {
				 result.error = 'history selection requires single match, got ' + result.patternMatch.length;
				 return xm.callAsync(callback, result.error, result);
				 }
				 tasks['history'] = (callback:(err, res) => void) => {
				 xm.callAsync(callback, null, null);
				 };
				 }*/
				if (selector.requiresSource) {
					if (result.patternMatch.length > 1) {
						result.error = 'source filtering selection requires single match, got ' + result.patternMatch.length;
						return xm.callAsync(callback, result.error, result);
					}

					tasks['source'] = (callback:(err, res) => void) => {

						var file = result.patternMatch[0];

						self.gitRaw.getFile(self.definitions.commitSha, file.path, (err, content) => {
							if (err) {
								return callback(err, null);
							}
							//xm.log(content);

							callback(err, null);
						});
					};
				}
				if (selector.sha) {
					// check sha
					result.error = 'implement sha filter';
					return xm.callAsync(callback, result.error, result);
				}
				//apply selector

				async.series(tasks,
					(err, res) => {

						callback(err, result);
					}
				);
			});
		}
	}
}