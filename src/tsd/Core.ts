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
///<reference path="data/DefIndex.ts" />
///<reference path="context/Config.ts" />
///<reference path="API.ts" />

///<reference path="logic/Resolver.ts" />

module tsd {
	'use strict';

	var Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
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

		//TODO unify into single object
		stats = new xm.StatCounter();
		log = xm.getLogger('Core');
		_debug:boolean = false;

		constructor(public context:tsd.Context) {
			xm.assertVar(context, tsd.Context, 'context');

			this.resolver = new tsd.Resolver(this);
			this.index = new tsd.DefIndex();

			this.gitRepo = new git.GithubRepo(this.context.config.repoOwner, this.context.config.repoProject);
			this.gitAPI = new git.GithubAPICached(this.gitRepo, path.join(this.context.paths.cacheDir, 'git-api'));
			this.gitRaw = new git.GithubRawCached(this.gitRepo, path.join(this.context.paths.cacheDir, 'git-raw'));

			//lets be gents
			//this.gitAPI.headers['User-Agent'] = this.context.packageInfo.getNameVersion();
			this.gitRaw.headers['User-Agent'] = this.context.packageInfo.getNameVersion();

			this.stats.logger = xm.getLogger('Core.stats');

			//setter
			this.debug = context.verbose;

			xm.ObjectUtil.hidePrefixed(this);
		}

		/*
		 lazy get or load the current DefIndex
		 promise: DefIndex: with a git-tree loaded and parsed for Defs (likely always the same)
		 */
		updateIndex():Q.Promise<void> {
			var d:Q.Deferred<void> = Q.defer();

			this.stats.count('index-start');
			if (this.index.hasIndex()) {
				this.stats.count('index-hit');

				d.resolve(null);
				return d.promise;
			}
			this.stats.count('index-miss');

			this.stats.count('index-branch-get');

			this.gitAPI.getBranch(this.context.config.ref).then((branchData:any) => {
				var sha = pointer.get(branchData, branch_tree);
				if (!sha) {
					this.stats.count('index-branch-get-fail');
					throw new Error('missing sha hash');
				}
				this.stats.count('index-branch-get-success');
				this.stats.count('index-tree-get');

				//keep for later
				return this.gitAPI.getTree(sha, true).then((data:any) => {
					//this.log(data);
					this.stats.count('index-tree-get-success');

					this.index.init(branchData, data);

					this.stats.count('index-success');
					d.resolve(null);
				}, (err) => {
					this.stats.count('index-tree-get-error');
					d.reject(err);
				});
			}).fail((err) => {
				this.stats.count('index-branch-get-error');
				d.reject(err);
			});

			return d.promise;
		}

		/*
		 run a selector against a DefIndex
		 promise: ApiResult
		 */
		select(selector:Selector):Q.Promise<APIResult> {
			var d:Q.Deferred<APIResult> = Q.defer();

			var res = new APIResult(this.index, selector);
			this.updateIndex().then(() => {
				res.nameMatches = selector.pattern.filter(this.index.list);
				// default to all heads
				res.selection = tsd.DefUtil.getHeads(res.nameMatches);
				//res.definitions = res.nameMatches.slice(0);

				//TODO apply some more filters in steps? or find better selection model (no god-method but iterative)
				if (selector.resolveDependencies) {
					return this.resolveDepencendiesBulk(res.selection);
				}
			}).then(() => {
				d.resolve(res);
			}, d.reject);

			return d.promise;
		}

		/*
		 procure a Def instance for a path
		 promise: Def: either fresh or with existing data
		 */
		procureDef(path:string):Q.Promise<Def> {
			var d:Q.Deferred<Def> = Q.defer();

			this.updateIndex().then(() => {
				var def:tsd.Def = this.index.procureDef(path);
				if (!def) {
					d.reject('cannot get def for path: ' + path);
					return;
				}
				d.resolve(def);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 procure a DefVersion instance for a path and commit
		 promise: DefVersion: either fresh or with existing data
		 */
		procureFile(path:string, commitSha:string):Q.Promise<DefVersion> {
			var d:Q.Deferred<DefVersion> = Q.defer();

			this.updateIndex().then(() => {
				var file:tsd.DefVersion = this.index.procureVersionFromSha(path, commitSha);
				if (!file) {
					d.reject('cannot get file for path: ' + path);
					return;
				}
				d.resolve(file);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 procure a DefCommit instance for a commit sha
		 promise: DefCommit: either fresh or with existing data
		 */
		procureCommit(commitSha:string):Q.Promise<DefCommit> {
			var d:Q.Deferred<DefCommit> = Q.defer();

			this.updateIndex().then(() => {
				var commit:tsd.DefCommit = this.index.procureCommit(commitSha);
				if (!commit) {
					d.reject('cannot commit def for commitSha: ' + path);
					return;
				}
				d.resolve(commit);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 find a DefVersion based on its path and a partial commit sha
		 promise: DefVersion
		 */
		findFile(path:string, commitShaFragment:string):Q.Promise<DefVersion> {
			var d:Q.Deferred<DefVersion> = Q.defer();
			//TODO implement partial commitSha lookup (github api does thi btu how do we track it?)
			//TODO cache Tree if searching (when querying against many commits)
			d.reject('implement me!');
			return d.promise;
		}

		/*
		 install a DefVersion and add to config
		 promise: string: absolute path of written file
		 */
		installFile(file:tsd.DefVersion, addToConfig:boolean = true):Q.Promise<string> {
			var d:Q.Deferred<string> = Q.defer();

			this.useFile(file).then((targetPath:string) => {
				if (this.context.config.hasFile(file.def.path)) {
					this.context.config.getFile(file.def.path).update(file);
				}
				else if (addToConfig) {
					this.context.config.addFile(file);
				}
				d.resolve(targetPath);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 bulk version of installFile()
		 promise: xm.IKeyValueMap: mapping path of written file -> DefVersion
		 */
		installFileBulk(list:tsd.DefVersion[], addToConfig:boolean = true):Q.Promise<xm.IKeyValueMap<DefVersion>> {
			var d:Q.Deferred<xm.IKeyValueMap<DefVersion>> = Q.defer();

			var written:xm.IKeyValueMap<tsd.DefVersion> = new xm.KeyValueMap();

			Q.all(list.map((file:tsd.DefVersion) => {
				return this.installFile(file, addToConfig).then((targetPath:string) => {
					written.set(file.def.path, file);
				});
			})).then(() => {
				d.resolve(written);
			}, d.reject);

			return d.promise;
		}

		/*
		 load the current configFile, optional to not throw error on missing file
		 promise: null
		 */
		readConfig(optional:boolean = false):Q.Promise<void> {
			var d:Q.Deferred<void> = Q.defer();

			FS.exists(this.context.paths.configFile).then((exists) => {
				if (!exists) {
					if (!optional) {
						d.reject(new Error('cannot locate file: ' + this.context.paths.configFile));
					}
					else {
						d.resolve(null);
					}
				}
				else {
					return xm.FileUtil.readJSONPromise(this.context.paths.configFile).then((json) => {
						this.context.config.parseJSON(json);
						d.resolve(null);
					});
				}
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 save current config to project json
		 promise: string: path of written file
		 */
		saveConfig():Q.Promise<string> {
			var d:Q.Deferred<string> = Q.defer();

			var target = this.context.paths.configFile;
			var json = JSON.stringify(this.context.config.toJSON(), null, 2);
			var dir = path.dirname(target);

			if (!json || json.length === 0) {
				return Q.reject(new Error('saveConfig retrieved empty json'));
			}

			xm.FileUtil.mkdirCheckQ(dir, true).then(() => {
				return FS.write(target, json).then(() => {
					//VOODOO call Fs.stat dummy to stop node.js from reporting the file is empty (when it is not)
					return FS.stat(target);
				}).then(() => {
					return Q.delay(100);
				}).then(() => {
					//now do the real check
					return FS.stat(target).then((stat) => {
						if (stat.size === 0) {
							throw new Error('saveConfig write zero bytes to: ' + target);
						}
					});
				});
			}).then(() => {
				d.resolve(target);
			}, d.reject);

			return d.promise;
		}

		/*
		 reinstall multiple DefVersion's from InstalledDef data
		 promise: xm.IKeyValueMap: mapping path of written file -> DefVersion
		 */
		reinstallBulk(list:tsd.InstalledDef[]):Q.Promise<xm.IKeyValueMap<DefVersion>> {
			var d:Q.Deferred<xm.IKeyValueMap<DefVersion>> = Q.defer();

			var written = new xm.KeyValueMap();

			Q.all(list.map((installed:tsd.InstalledDef) => {
				return this.procureFile(installed.path, installed.commitSha).then((file:tsd.DefVersion)=> {
					return this.installFile(file, true).then((targetPath:string) => {
						written.set(file.def.path, file);
						return file;
					});
				});
			})).then(() => {
				d.resolve(written);
			}, d.reject);

			return d.promise;
		}

		/*
		 lazy load a single DefCommit meta data
		 promise: DefCommit with meta data fields (authors, message etc)
		 */
		loadCommitMetaData(commit:tsd.DefCommit):Q.Promise<DefCommit> {
			var d:Q.Deferred<DefCommit> = Q.defer();

			if (commit.hasMetaData()) {
				return Q(commit);
			}
			this.gitAPI.getCommit(commit.commitSha).then((json:any) => {
				commit.parseJSON(json);
				d.resolve(commit);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 lazy load a single DefVersion file content
		 promise: DefVersion; with raw .blob loaded
		 */
		loadContent(file:tsd.DefVersion):Q.Promise<DefVersion> {
			var d:Q.Deferred<DefVersion> = Q.defer();

			if (file.hasContent()) {
				return Q(file);
			}
			this.gitRaw.getFile(file.commit.commitSha, file.def.path).then((content) => {
				//var sha = git.GitUtil.blobShaHex(content, 'utf8');
				if (file.blob) {
					// race
					if (!file.blob.hasContent()) {
						try {
							file.blob.setContent(content);
						}
						catch (err) {
							xm.log.debug(err);
							xm.log.debug('path', file.def.path);
							xm.log.debug('commitSha', file.commit.commitSha);
							xm.log.debug('treeSha', file.commit.treeSha);
							xm.log.error('failed to set content');
							//throw new Error('failed to set content');
							throw err;
						}
					}
				}
				else {
					file.setContent(this.index.procureBlobFor(content));
				}
				d.resolve(file);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 bulk version of loadContent
		 promise: array: bulk results of single calls
		 */
		loadContentBulk(list:tsd.DefVersion[]):Q.Promise<DefVersion[]> {
			var d:Q.Deferred<DefVersion[]> = Q.defer();

			Q.all(list.map((file:DefVersion) => {
				return this.loadContent(file);
			})).then((list) => {
				d.resolve(list);
			}, d.reject);

			return d.promise;
		}

		/*
		 lazy load commit history meta data
		 promise: Def with .history filled with DefVersion
		 */
		loadHistory(def:tsd.Def):Q.Promise<Def> {
			var d:Q.Deferred<Def> = Q.defer();

			if (def.history.length > 0) {
				return Q(def);
			}
			this.gitAPI.getPathCommits(this.context.config.ref, def.path).then((content:any[]) => {
				//this.log.inspect(content, null, 2);
				//TODO add pagination support (see github api docs)
				this.index.setHistory(def, content);

				d.resolve(def);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 bulk version of loadHistory()
		 promise: array: bulk results of single calls
		 */
		loadHistoryBulk(list:tsd.Def[]):Q.Promise<DefVersion[]> {
			var d:Q.Deferred<DefVersion[]> = Q.defer();

			list = tsd.DefUtil.uniqueDefs(list);

			Q.all(list.map((file:Def) => {
				return this.loadHistory(file);
			})).then((list) => {
				d.resolve(list);
			}, d.reject);

			return d.promise;
		}

		/*
		 lazy resolve a DefVersion's dependencies
		 promise: DefVersion: with .dependencies resolved (recursive)
		 */
		//TODO ditch wrapper function? meh?
		resolveDepencendies(file:tsd.DefVersion):Q.Promise<DefVersion> {
			return this.resolver.resolveDeps(file);
		}

		/*
		 bulk version of resolveDepencendies()
		 promise: array: bulk results of single calls
		 */
		resolveDepencendiesBulk(list:tsd.DefVersion[]):Q.Promise<DefVersion[]> {
			return this.resolver.resolveBulk(list);
		}

		/*
		 lazy load a DefVersion content and parse header for DefInfo meta data
		 promise: DefVersion: with raw .content text and .info DefInfo filled with parsed meta data
		 */
		parseDefInfo(file:tsd.DefVersion):Q.Promise<DefVersion> {
			var d:Q.Deferred<DefVersion> = Q.defer();

			this.loadContent(file).then((file:tsd.DefVersion) => {
				var parser = new tsd.DefInfoParser(this.context.verbose);
				if (file.info) {
					//TODO why not do an early bail? skip reparse?
					file.info.resetFields();
				}
				else {
					file.info = new tsd.DefInfo();
				}

				parser.parse(file.info, file.blob.content.toString('utf8'));

				if (!file.info.isValid()) {
					this.log.warn('bad parse in: ' + file);
					//TODO print more debug info
				}
				d.resolve(file);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 bulk version of parseDefInfo()
		 promise: array: bulk results of single calls
		 */
		parseDefInfoBulk(list:tsd.DefVersion[]):Q.Promise<DefVersion[]> {
			var d:Q.Deferred<DefVersion[]> = Q.defer();
			// needed?
			list = tsd.DefUtil.uniqueDefVersion(list);

			Q.all(list.map((file:tsd.DefVersion) => {
				return this.parseDefInfo(file);

			})).then((list) => {
				d.resolve(list);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 lazy load and save a single DefVersion to typings folder
		 promise: DefVersion
		 */
		useFile(file:tsd.DefVersion, overwrite:boolean = true):Q.Promise<string> {
			var d:Q.Deferred<string> = Q.defer();

			var typingsDir = this.context.config.resolveTypingsPath(path.dirname(this.context.paths.configFile));
			var targetPath = path.join(typingsDir, file.def.path.replace(/[//\/]/g, path.sep));

			FS.exists(targetPath).then((exists:boolean) => {
				if (exists && !overwrite) {
					//bail
					return null;
				}
				//write
				return this.loadContent(file).then(() => {
					//check again? (race?)
					return FS.exists(targetPath);
				}).then((exists) => {
					if (exists) {
						return FS.remove(targetPath);
					}
					return xm.FileUtil.mkdirCheckQ(path.dirname(targetPath), true);
				}).then(() => {
					return FS.write(targetPath, file.blob.content);
				});
			}).then(() => {
				d.resolve(targetPath);
			}, d.reject);

			return d.promise;
		}

		/*
		 bulk version of useFile()
		 promise: xm.IKeyValueMap: mapping absolute path of written file -> DefVersion
		 */
		useFileBulk(list:tsd.DefVersion[], overwrite:boolean = true):Q.Promise<xm.IKeyValueMap<DefVersion>> {
			var d:Q.Deferred<xm.IKeyValueMap<DefVersion>> = Q.defer();

			// needed?
			list = tsd.DefUtil.uniqueDefVersion(list);

			//this could be a bit more then just 'written'
			var written:xm.IKeyValueMap<DefVersion> = new xm.KeyValueMap();

			Q.all(list.map((file:tsd.DefVersion) => {
				return this.useFile(file, overwrite).then((targetPath:string) => {
					written.set(file.def.path, file);
				});
			})).then(() => {
				d.resolve(written);
			}, d.reject);

			return d.promise;
		}

		get debug():boolean {
			return this._debug;
		}

		set debug(value:boolean) {
			this._debug = value;
			this.gitAPI.debug = this._debug;
			this.gitRaw.debug = this._debug;

			this.stats.log = this._debug;
			this.resolver.stats.log = this._debug;
		}
	}
}
