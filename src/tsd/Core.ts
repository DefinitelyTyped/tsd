///<reference path="../git/GithubAPICached.ts" />
///<reference path="../git/GithubRepo.ts" />
///<reference path="../git/GithubRawCached.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="data/DefUtil.ts" />
///<reference path="data/DefVersion.ts" />
///<reference path="data/Def.ts" />
///<reference path="data/DefIndex.ts" />
///<reference path="data/DefInfoParser.ts" />
///<reference path="data/DefInfo.ts" />

///<reference path="API.ts" />

module tsd {

	var Q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');
	var assert = require('assert');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var pointer = require('jsonpointer.js');

	var branch_tree:string = '/commit/commit/tree/sha';

	export class APIOptions {
		constructor() {

		}
	}

	//TODO rename to DefSelection?
	export class APIResult {

		error:string;
		nameMatches:tsd.Def[];
		selection:tsd.DefVersion[];
		written:string[];
		//files = new xm.KeyValueMap();

		constructor(public selector:Selector, public options?:APIOptions) {
			xm.assertVar('selector', selector, Selector);
		}
	}

	export class APISelection {
		constructor() {

		}
	}
	/*
	Core: operational core logic
	 */
	export class Core {

		gitRepo:git.GithubRepo;
		gitAPI:git.GithubAPICached;
		gitRaw:git.GithubRawCached;
		index:tsd.DefIndex;

		constructor(public context:tsd.Context) {
			xm.assertVar('context', context, tsd.Context);

			this.index = new tsd.DefIndex();

			this.gitRepo = new git.GithubRepo(context.config.repoOwner, context.config.repoProject);
			this.gitAPI = new git.GithubAPICached(this.gitRepo, path.join(context.paths.cache, 'git_api'));
			this.gitRaw = new git.GithubRawCached(this.gitRepo, path.join(context.paths.cache, 'git_raw'));
		}

		getIndex():Qpromise {
			var self:tsd.Core = this;

			if (this.index.hasData()) {
				return Q(null);
			}

			var branchData;

			return self.gitAPI.getBranch(self.context.config.ref).then((data:any) => {
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
				self.index.setBranchTree(branchData, data);

				return null;
			});
		}

		select(selector:Selector, options:APIOptions):Qpromise {
			var self:tsd.Core = this;
			var result = new APIResult(selector, options);

			return self.getIndex().then(() => {

				result.nameMatches = selector.pattern.matchTo(self.index.list);

				// default to all heads
				result.selection = tsd.DefUtil.getHeads(result.nameMatches);

				return result;

				//TODO clean this up here

				//var tasks = [];
				/*
				 //TODO fix crude filter
				 if (selector.requiresHistory) {
				 if (result.nameMatch.length > 1) {
				 result.error = 'history selection requires single match, got ' + result.nameMatch.length;
				 throw(new Error(result.error));
				 }
				 }
				 //if (selector.requiresSource) {
				 /*if (nameMatch.length > 1) {
				 result.error = 'source filtering selection requires single match, got ' + nameMatch.length;
				 throw(new Error(result.error));
				 }

				 var file = nameMatch[0];

				 return self.gitAPI.getPathCommits(self.context.config.ref, file.path);
				 }).then((data) => {
				 //TODO dev mode
				 //xm.log('getPathCommits');
				 //xm.log(data)
				 return data;
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
				//return Q.reject(new Error('what to do?'));
			});
		}

		loadContent(file:tsd.DefVersion):Qpromise {
			var self:Core = this;

			if (file.content) {
				return Q(file.content);
			}
			return self.gitRaw.getFile(file.commitSha, file.def.path).then((content) => {
				file.content = String(content);
				return file;
			});
		}

		loadContentBulk(list:tsd.DefVersion[]):Qpromise {
			var self:Core = this;

			return Q.all(list.map((file:DefVersion) => {
				return self.loadContent(file);
			})).thenResolve(list);
		}

		parseDefInfo(file:tsd.DefVersion):Qpromise {
			var self:Core = this;

			return self.loadContent(file).then((file:tsd.DefVersion) => {
				var parser = new tsd.DefInfoParser(self.context.verbose);
				if (file.info) {
					file.info.resetFields();
				}
				else {
					file.info = new tsd.DefInfo();
				}

				parser.parse(file.info, file.content);

				if (!file.info.isValid()) {
					xm.log.warn('bad parse in: ' + file);
				}
				return file;
			});//.thenResolve(file);
		}

		parseDefInfoBulk(list:tsd.DefVersion[]):Qpromise {
			var self:Core = this;

			// needed?
			list = DefUtil.uniqueDefPaths(list);

			return Q.all(list.map((file:tsd.DefVersion) => {
				return self.parseDefInfo(file);
			})).thenResolve(list);
		}

		writeFile(file:DefVersion):Qpromise {
			var self:Core = this;

			var target = path.resolve(self.context.paths.typings, file.def.path);
			var dir = path.dirname(target);

			return Q.nfcall(mkdirp, dir).then(():any => {
				if (file.content) {
					return file.content;
				}
				return self.loadContent(file);
			}).then(() => {
				return FS.exists(target);
			}).then((exists:bool) => {
				if (exists) {
					return FS.remove(target);
				}
				return null;
			}).then(() => {
				return FS.write(target, file.content);
			}).then(() => {
				return target;
			});
		}

		writeFileBulk(list:tsd.DefVersion[]):Qpromise {
			var self:Core = this;

			// needed?
			list = DefUtil.uniqueDefPaths(list);

			return Q.all(list.map((file:tsd.DefVersion) => {
				return self.writeFile(file);
			}));
		}

		saveToConfigBulk(list:tsd.DefVersion[]):Qpromise {
			var self:Core = this;

			return Q.reject(new Error('not yet implemented'));
		}
	}
}