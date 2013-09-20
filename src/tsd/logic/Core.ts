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
///<reference path="../data/DefIndex.ts" />
///<reference path="../context/Config.ts" />
///<reference path="../API.ts" />

///<reference path="Resolver.ts" />

module tsd {

	var Q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');
	var path = require('path');
	var pointer = require('jsonpointer.js');

	var branch_tree:string = '/commit/commit/tree/sha';

	var leadingExp = /^\.\.\//;
	/*
	 Core: operational core logics
	 */
	//TODO split over files? why bother?
	//TODO add more evnt logs, like in xm.CachedLoader
	export class Core {

		gitRepo:git.GithubRepo;
		gitAPI:git.GithubAPICached;
		gitRaw:git.GithubRawCached;

		index:tsd.DefIndex;
		resolver:tsd.Resolver;

		stats = new xm.StatCounter();
		log = xm.getLogger('Core');
		_debug:bool = false;

		constructor(public context:tsd.Context) {
			xm.assertVar('context', context, tsd.Context);

			this.resolver = new tsd.Resolver(this);
			this.index = new tsd.DefIndex();

			this.gitRepo = new git.GithubRepo(this.context.config.repoOwner, this.context.config.repoProject);
			this.gitAPI = new git.GithubAPICached(this.gitRepo, path.join(this.context.paths.cacheDir, 'git_api'));
			this.gitRaw = new git.GithubRawCached(this.gitRepo, path.join(this.context.paths.cacheDir, 'git_raw'));

			this.stats.logger = xm.getLogger('Core.stats');

			//setter
			this.debug = context.verbose;

			xm.ObjectUtil.hidePrefixed(this);
		}

		/*
		 lazy get or load the current DefIndex
		 promise: DefIndex: with a git-tree loaded and parsed for Defs (likely always the same)
		 */
		getIndex():Qpromise {
			this.stats.count('index-start');
			if (this.index.hasIndex()) {
				this.stats.count('index-hit');
				return Q(this.index);
			}
			this.stats.count('index-miss');

			var branchData;

			this.stats.count('index-branch-get');

			return this.gitAPI.getBranch(this.context.config.ref).then((data:any) => {
				var sha = pointer.get(data, branch_tree);
				if (!sha) {
					this.stats.count('index-branch-get-fail');
					throw new Error('missing sha hash');
				}
				this.stats.count('index-branch-get-success');
				this.stats.count('index-tree-get');
				//keep for later
				branchData = data;
				return this.gitAPI.getTree(sha, true);
			},(err) => {
				this.stats.count('index-branch-get-error');
				throw err;
			}).then((data:any) => {
				//this.log(data);
				this.stats.count('index-tree-get-success');
				this.index.init(branchData, data);

				return this.index;
			}, (err) => {
				this.stats.count('index-tree-get-error');
				throw err;
			});
		}

		/*
		 run a selector against a DefIndex
		 promise: ApiResult
		 */
		select(selector:Selector):Qpromise {
			var result = new APIResult(this.index, selector);

			return this.getIndex().then(() => {
				result.nameMatches = selector.pattern.filter(this.index.list);
				// default to all heads
				result.selection = tsd.DefUtil.getHeads(result.nameMatches);
				//result.definitions = result.nameMatches.slice(0);

				//TODO apply some more filters in steps? or find better selection model (no god-method but iterative)
				if (selector.resolveDependencies) {
					return this.resolveDepencendiesBulk(result.selection);
				}
				return null;

			}).thenResolve(result);
		}

		/*
		 procure a Def instance for a path
		 promise: Def: either fresh or with existing data
		 */
		procureDef(path:string):Qpromise {
			return this.getIndex().then(() => {
				var def:tsd.Def = this.index.procureDef(path);
				if (!def) {
					return Q.reject(new Error('cannot get def for path: ' + path));
				}
				return Q(def);
			});
		}

		/*
		 procure a DefVersion instance for a path and commit
		 promise: DefVersion: either fresh or with existing data
		 */
		procureFile(path:string, commitSha:string):Qpromise {
			return this.getIndex().then(() => {
				var file:tsd.DefVersion = this.index.procureVersionFromSha(path, commitSha);
				if (!file) {
					return Q.reject(new Error('cannot get file for path: ' + path));
				}
				return Q(file);
			});
		}

		/*
		 procure a DefCommit instance for a commit sha
		 promise: DefCommit: either fresh or with existing data
		 */
		procureCommit(commitSha:string):Qpromise {
			return this.getIndex().then(() => {
				var commit:tsd.DefCommit = this.index.procureCommit(commitSha);
				if (!commit) {
					return Q.reject(new Error('cannot commit def for commitSha: ' + path));
				}
				return Q(commit);
			});
		}

		/*
		 find a DefVersion based on its path and a partial commit sha
		 promise: DefVersion
		 */
		findFile(path:string, commitShaFragment:string):Qpromise {
			//TODO implement partial commitSha lookup, tricky as it could be a random commit and not just an actual change)
			return Q.reject('implement me!');
		}

		/*
		 install a DefVersion and add to config
		 promise: string: absolute path of written file
		 */
		installFile(file:tsd.DefVersion, addToConfig:bool = true):Qpromise {
			return this.useFile(file).then((targetPath:string) => {
				//this.log(paths.keys().join('\n'));

				if (this.context.config.hasFile(file.def.path)) {
					this.context.config.getFile(file.def.path).update(file);
				}
				else if (addToConfig) {
					this.context.config.addFile(file);
				}
				return targetPath;
			});
		}

		/*
		 bulk version of installFile()
		 promise: xm.IKeyValueMap: mapping absolute path of written file -> DefVersion
		 */
		installFileBulk(list:tsd.DefVersion[], addToConfig:bool = true):Qpromise {
			var written:xm.IKeyValueMap = new xm.KeyValueMap();

			return Q.all(list.map((file:tsd.DefVersion) => {
				return this.installFile(file, addToConfig).then((targetPath:string) => {
					written.set(targetPath, file);
				});
			})).thenResolve(written);
		}

		/*
		 load the current configFile, optional to not throw error on missing file
		 promise: null
		 */
		readConfig(optional?:bool = false):Qpromise {
			return FS.exists(this.context.paths.configFile).then((exists) => {
				if (!exists) {
					if (!optional) {
						throw new Error('cannot locate file: ' + this.context.paths.configFile);
					}
					return null;
				}
				return xm.FileUtil.readJSONPromise(this.context.paths.configFile).then((json) => {
					this.context.config.parseJSON(json);
					return null;
				});
			});
		}

		/*
		 save current config to project json
		 promise: string: absolute path of written file
		 */
		saveConfig():Qpromise {
			var json = JSON.stringify(this.context.config.toJSON(), null, 2);
			var dir = path.dirname(this.context.paths.configFile);

			return xm.mkdirCheckQ(dir, true).then(() => {
				return FS.write(this.context.paths.configFile, json);
			}).then(() => {
				return this.context.paths.configFile;
			});
		}

		/*
		 reinstall multiple DefVersion's from InstalledDef data
		 promise: xm.IKeyValueMap: mapping absolute path of written file -> DefVersion
		 */
		reinstallBulk(list:tsd.InstalledDef[]):Qpromise {
			var written = new xm.KeyValueMap();

			return Q.all(list.map((installed:tsd.InstalledDef) => {
				return this.procureFile(installed.path, installed.commitSha).then((file:tsd.DefVersion)=> {
					return this.installFile(file, true).then((targetPath:string) => {
						written.set(targetPath, file);
						return file;
					});
				});
			})).thenResolve(written);
		}

		/*
		 lazy load a single DefCommit meta data
		 promise: DefCommit with meta data fields (authors, message etc)
		 */
		loadCommitMetaData(commit:tsd.DefCommit):Qpromise {
			if (commit.hasMetaData()) {
				return Q(commit);
			}
			return this.gitAPI.getCommit(commit.commitSha).then((json:any) => {
				commit.parseJSON(json);
				return commit;
			});
		}

		/*
		 lazy load a single DefVersion file content
		 promise: DefVersion; with raw .content loaded
		 */
		loadContent(file:tsd.DefVersion):Qpromise {
			if (file.content) {
				return Q(file.content);
			}
			return this.gitRaw.getFile(file.commit.commitSha, file.def.path).then((content) => {
				file.content = String(content);
				return file;
			});
		}

		/*
		 bulk version of loadContent
		 promise: array: bulk results of single calls
		 */
		loadContentBulk(list:tsd.DefVersion[]):Qpromise {
			return Q.all(list.map((file:DefVersion) => {
				return this.loadContent(file);
			})).thenResolve(list);
		}

		/*
		 lazy load a DefVersion commit history meta data
		 promise: Def with .history filled with DefVersion
		 */
		loadHistory(file:tsd.Def):Qpromise {
			if (file.history.length > 0) {
				return Q(file);
			}
			return this.gitAPI.getPathCommits(this.context.config.ref, file.path).then((content:any[]) => {
				//this.log.inspect(content, null, 2);
				//TODO add pagination support (see github api docs)
				this.index.setHistory(file, content);
				return file;
			});
		}

		/*
		 bulk version of loadHistory()
		 promise: array: bulk results of single calls
		 */
		loadHistoryBulk(list:tsd.Def[]):Qpromise {
			list = tsd.DefUtil.uniqueDefs(list);

			return Q.all(list.map((file:Def) => {
				return this.loadHistory(file);
			})).thenResolve(list);
		}

		/*
		 lazy resolve a DefVersion's dependencies
		 promise: DefVersion: with .dependencies resolved (recursive)
		 */
		//TODO ditch wrapper function? meh?
		resolveDepencendies(file:tsd.DefVersion):Qpromise {
			return this.resolver.resolve(file);
		}

		/*
		 bulk version of resolveDepencendies()
		 promise: array: bulk results of single calls
		 */
		resolveDepencendiesBulk(list:tsd.DefVersion[]):Qpromise {
			return this.resolver.resolveBulk(list);
		}

		/*
		 lazy load a DefVersion content and parse header for DefInfo meta data
		 promise: DefVersion: with raw .content text and .info DefInfo filled with parsed meta data
		 */
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
					this.log.warn('bad parse in: ' + file);
					//TODO print more debug info
				}
				return file;
			});//.thenResolve(file);
		}

		/*
		 bulk version of parseDefInfo()
		 promise: array: bulk results of single calls
		 */
		parseDefInfoBulk(list:tsd.DefVersion[]):Qpromise {
			// needed?
			list = tsd.DefUtil.uniqueDefVersion(list);

			return Q.all(list.map((file:tsd.DefVersion) => {
				return this.parseDefInfo(file);
			})).thenResolve(list);
		}

		/*
		 lazy load and save a single DefVersion to typings folder
		 promise: absolute path of written file
		 */
		useFile(file:tsd.DefVersion, overwrite:bool = true):Qpromise {
			var targetPath = path.resolve(this.context.config.typingsPath, file.def.path);
			var dir = path.dirname(targetPath);

			return FS.exists(targetPath).then((exists:bool) => {
				if (exists && !overwrite) {
					//bail
					return null;
				}
				//write
				return this.loadContent(file).then(() => {
					//check again? (race?)
					return FS.exists(targetPath);
				}).then((exists:bool) => {
					if (exists) {
						return FS.remove(targetPath);
					}
					return xm.mkdirCheckQ(dir, true);
				}).then(() => {
					return FS.write(targetPath, file.content);
				}).then(() => {
					//return the target path
					return targetPath;
				});
			});
		}

		/*
		 bulk version of useFile()
		 promise: xm.IKeyValueMap: mapping absolute path of written file -> DefVersion
		 */
		useFileBulk(list:tsd.DefVersion[], overwrite:bool = true):Qpromise {
			// needed?
			list = tsd.DefUtil.uniqueDefVersion(list);

			//this could be a bit more then just 'written'
			var written = new xm.KeyValueMap();

			return Q.all(list.map((file:tsd.DefVersion) => {
				return this.useFile(file, overwrite).then((targetPath:string) => {
					written.set(targetPath, file);
				});
			})).thenResolve(written);
		}

		get debug():bool {
			return this._debug;
		}

		set debug(value:bool) {
			this._debug = value;
			this.gitAPI.debug = this._debug;
			this.gitRaw.debug = this._debug;

			this.stats.log = this._debug;
			this.resolver.stats.log = this._debug;
		}
	}
}