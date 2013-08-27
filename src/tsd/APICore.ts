///<reference path="../git/GithubAPICached.ts" />
///<reference path="../git/GithubURLManager.ts" />
///<reference path="../git/GithubRawFile.ts" />
///<reference path="../xm/callAsync.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="data/Decoder.ts" />
///<reference path="context/Context.ts" />
///<reference path="data/Definition.ts" />
///<reference path="API.ts" />

module tsd {

	var Q:QStatic = require('q');
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
		//files = new xm.KeyValueMap();

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

			this.gitRepo = new git.GithubRepo(context.config.repoOwner, context.config.repoProject);

			this.gitURL = new git.GithubURLManager(this.gitRepo);
			this.gitAPI = new git.GithubAPICached(this.gitRepo,
			path.join(context.paths.cache, 'git')
			);
			this.gitRaw = new git.GithubRawFile(this.gitURL);
		}

		getIndex():Qpromise {
			var self:APICore = this;

			if (this.definitions.hasBranch()) {
				return Q(null);
			}

			var branchData;

			return self.gitAPI.getBranch(this.context.config.ref).then((data:any) => {
				var sha = pointer.get(data, branch_tree);
				if (!sha) {
					throw new Error('missing sha hash');
				}
				//keep for later
				branchData = data;
				return self.gitAPI.getTree(sha, true);
			})
			.then((data:any) => {
				//xm.log(data);
				self.definitions.setBranchTree(branchData, data);

				return null;
			});
		}

		select(selector:Selector, options:APIOptions):Qpromise {
			var self:APICore = this;

			var result = new APIResult('select', selector, options);

			return self.getIndex().then(() => {
				result.patternMatch = selector.pattern.matchTo(self.definitions.list);

				var tasks = [];

				//TODO fix crude filter
				/*if (selector.requiresHistory) {
				 if (result.patternMatch.length > 1) {
				 result.error = 'history selection requires single match, got ' + result.patternMatch.length;
				 throw(new Error(result.error));
				 }
				 }*/
				//if (selector.requiresSource) {
					if (result.patternMatch.length > 1) {
						result.error = 'source filtering selection requires single match, got ' + result.patternMatch.length;
						throw(new Error(result.error));
					}

					var file = result.patternMatch[0];

					return self.gitRaw.getFile(self.definitions.commitSha, file.path).then((content) => {
						//xm.log('getFile');
						//xm.log(content);

						//TODO this is not right
						file.content = content;

						return file;
					}).then((file) => {
						//TODO better query bu sha instead of branch name (better auto-caching)
						return self.gitAPI.getPathCommits(self.context.config.ref, file.path).then((data) => {
							xm.log('getPathCommits');
							xm.log(data);
							return data;
						});
					}).then(() => {
						// beh
						return result;
					});
				//}
				/*if (selector.sha) {
				 // check sha
				 result.error = 'implement sha filter';
				 throw(new Error(result.error));
				 }*/
				//apply selector
				return Q.reject(new Error('what to do?'));
			});
		}
	}
}