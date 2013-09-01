///<reference path="../../git/GithubAPICached.ts" />
///<reference path="../../git/GithubRepo.ts" />
///<reference path="../../git/GithubRawCached.ts" />
///<reference path="../../xm/assertVar.ts" />
///<reference path="../data/DefUtil.ts" />
///<reference path="../data/DefVersion.ts" />
///<reference path="../data/Def.ts" />
///<reference path="../data/DefIndex.ts" />
///<reference path="../data/DefInfoParser.ts" />
///<reference path="../data/DefInfo.ts" />

///<reference path="../API.ts" />
///<reference path="../data/DefIndex.ts" />

module tsd {

	var Q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');
	var assert = require('assert');
	var path = require('path');
	var pointer = require('jsonpointer.js');

	var branch_tree:string = '/commit/commit/tree/sha';

	//TODO rename to DefSelection?
	export class APIResult {

		error:string;
		nameMatches:tsd.Def[];
		selection:tsd.DefVersion[];
		definitions:tsd.Def[];
		written:string[];
		//files = new xm.KeyValueMap();

		constructor(public index:DefIndex, public selector:Selector) {
			xm.assertVar('selector', selector, Selector);
		}
	}
	/*
	Core: operational core logic
	 */
	//TODO split over files? why bother?
	export class Core {

		gitRepo:git.GithubRepo;
		gitAPI:git.GithubAPICached;
		gitRaw:git.GithubRawCached;

		//TODO make collection, keep collection of DefIndex's (map against branch ref)
		index:tsd.DefIndex;

		constructor(public context:tsd.Context) {
			xm.assertVar('context', context, tsd.Context);

			this.index = new tsd.DefIndex();

			this.gitRepo = new git.GithubRepo(context.config.repoOwner, context.config.repoProject);
			this.gitAPI = new git.GithubAPICached(this.gitRepo, path.join(context.paths.cache, 'git_api'));
			this.gitRaw = new git.GithubRawCached(this.gitRepo, path.join(context.paths.cache, 'git_raw'));

			this.gitAPI.debug = this.context.verbose;
			this.gitRaw.debug = this.context.verbose;
		}

		//TODO harden loader tasks against race conditions? hmm..
		//TODO parameterise index selection
		getIndex():Qpromise {
			if (this.index.hasIndex()) {
				return Q(this.index);
			}

			var branchData;

			return this.gitAPI.getBranch(this.context.config.ref).then((data:any) => {
				var sha = pointer.get(data, branch_tree);
				if (!sha) {
					throw new Error('missing sha hash');
				}
				//keep for later
				branchData = data;
				return this.gitAPI.getTree(sha, true);
			})
			.then((data:any) => {
				//xm.log(data);
				this.index.init(branchData, data);

				return this.index;
			});
		}
		//TODO move select() to /select package
		//TODO find better selection model (no god-method but iterative)
		select(selector:Selector):Qpromise {
			var result = new APIResult(this.index, selector);

			return this.getIndex().then((index:DefIndex) => {

				result.nameMatches = selector.pattern.filter(this.index.list);
				// default to all heads
				result.selection = tsd.DefUtil.getHeads(result.nameMatches);
				//result.definitions = result.nameMatches.slice(0);

				var extra = [];
				/*if (selector.requiresHistory) {
					if (result.selection.length > 3) {
						throw new Error('history selection requires single match, got ' + result.selection.length);
					}
					extra.push(this.loadHistoryBulk(tsd.DefUtil.getDefs(result.selection)));
				}

				if (selector.requiresSource) {
					extra.push(this.loadContentBulk(result.selection));
				}*/

				return Q.all(extra).then(() => {
					if (selector.resolveDependencies) {
						return this.resolveDepencendiesBulk(result.selection);
					}
					return null;
				}).then(() => {
					if (selector.requiresSource) {
						return this.loadContentBulk(result.selection);
					}
					return null;
				});
			}).thenResolve(result);
		}

		loadContent(file:tsd.DefVersion):Qpromise {
			if (file.content) {
				return Q(file.content);
			}
			return this.gitRaw.getFile(file.commit.commitSha, file.def.path).then((content) => {
				file.content = String(content);
				return file;
			});
		}

		loadContentBulk(list:tsd.DefVersion[]):Qpromise {
			return Q.all(list.map((file:DefVersion) => {
				return this.loadContent(file);
			})).thenResolve(list);
		}

		loadHistory(file:tsd.Def):Qpromise {
			if (file.history.length > 0) {
				return Q(file);
			}
			return this.gitAPI.getPathCommits(this.context.config.ref, file.path).then((content:any[]) => {
				//xm.log.inspect(content, null, 2);
				this.index.setHistory(file, content);
				return file;
				//TODO add pagination support (see github api docs)
			});
		}

		loadHistoryBulk(list:tsd.Def[]):Qpromise {
			list = tsd.DefUtil.uniqueDefs(list);

			return Q.all(list.map((file:Def) => {
				return this.loadHistory(file);
			})).thenResolve(list);
		}

		resolveDepencendies(file:tsd.DefVersion):Qpromise {
			///TODO tricky.. needs to manage simultaneous loading (race conditions)
			return null;
		}

		resolveDepencendiesBulk(list:tsd.DefVersion[]):Qpromise {
			//list = tsd.DefUtil.uniqueDefs(list);

			return Q.all(list.map((file:DefVersion) => {
				return this.resolveDepencendies(file);
			})).thenResolve(list);
		}

		parseDefInfo(file:tsd.DefVersion):Qpromise {
			return this.loadContent(file).then((file:tsd.DefVersion) => {
				var parser = new tsd.DefInfoParser(this.context.verbose);
				if (file.info) {
					//TODO why not do an early bail? skip reparse?
					file.info.resetFields();
				}
				else {
					file.info = new tsd.DefInfo();
				}

				parser.parse(file.info, file.content);

				if (!file.info.isValid()) {
					xm.log.warn('bad parse in: ' + file);
					//TODO print more debug info
				}
				return file;
			});//.thenResolve(file);
		}

		parseDefInfoBulk(list:tsd.DefVersion[]):Qpromise {
			// needed?
			list = tsd.DefUtil.uniqueDefVersion(list);

			return Q.all(list.map((file:tsd.DefVersion) => {
				return this.parseDefInfo(file);
			})).thenResolve(list);
		}

		writeFile(file:DefVersion):Qpromise {
			var target = path.resolve(this.context.paths.typings, file.def.path);
			var dir = path.dirname(target);

			return xm.mkdirCheckQ(dir).then(():any => {
				if (file.content) {
					return file.content;
				}
				return this.loadContent(file);
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
			// needed?
			list = tsd.DefUtil.uniqueDefVersion(list);

			return Q.all(list.map((file:tsd.DefVersion) => {
				return this.writeFile(file);
			}));
		}

		saveToConfigBulk(list:tsd.DefVersion[]):Qpromise {
			return Q.reject(new Error('not yet implemented'));
		}
	}
}