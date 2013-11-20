///<reference path="../git/GithubRepo.ts" />
///<reference path="../xm/assertVar.ts" />

///<reference path="context/Config.ts" />

///<reference path="logic/SubCore.ts" />
///<reference path="logic/Resolver.ts" />
///<reference path="logic/IndexManager.ts" />
///<reference path="logic/ConfigIO.ts" />
///<reference path="logic/ContentLoader.ts" />
///<reference path="logic/Installer.ts" />
///<reference path="logic/InfoParser.ts" />
///<reference path="logic/ContentLoader.ts" />

///<reference path="API.ts" />

module tsd {
	'use strict';

	var Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var path = require('path');

	var leadingExp = /^\.\.\//;
	/*
	 Core: operational core logics
	 */
	//TODO split over files? why bother?
	//TODO add more evnt logs, like in xm.CachedLoader
	export class Core {

		context:tsd.Context;
		repo:git.GithubRepo;

		index:tsd.IndexManager;
		config:tsd.ConfigIO;
		content:tsd.ContentLoader;
		parser:tsd.InfoParser;
		installer:tsd.Installer;
		resolver:tsd.Resolver;

		track:xm.EventLog;

		_components:tsd.MultiManager;

		constructor(context:tsd.Context) {
			xm.assertVar(context, tsd.Context, 'context');
			this.context = context;

			this._components = new tsd.MultiManager(this);
			this._components.add([
				this.repo = new git.GithubRepo(this.context.config.repoOwner, this.context.config.repoProject, path.join(this.context.paths.cacheDir)),

				this.index = new tsd.IndexManager(this),
				this.config = new tsd.ConfigIO(this),
				this.content = new tsd.ContentLoader(this),
				this.parser = new tsd.InfoParser(this),
				this.installer = new tsd.Installer(this),
				this.resolver = new tsd.Resolver(this)
			]);

			//lets be gents
			//this.repo.api.headers['User-Agent'] = this.context.packageInfo.getNameVersion();
			this.repo.raw.headers['User-Agent'] = this.context.packageInfo.getNameVersion();

			this.track = new xm.EventLog('core', 'Core');
			this.verbose = this.context.verbose;

			xm.ObjectUtil.lockProps(this, Object.keys(this));
		}

		getInstallPath(def:tsd.Def):string {
			return path.join(this.context.getTypingsDir(), def.path.replace(/[//\/]/g, path.sep));
		}

		/*
		 run a selector against a DefIndex
		 promise: ApiResult
		 */
		//TODO move to SubCore?
		select(selector:Selector):Q.Promise<APIResult> {
			var d:Q.Deferred<APIResult> = Q.defer();

			this.track.promise(d.promise, 'select');

			var res = new APIResult(selector);

			this.index.getIndex().progress(d.notify).then((index:tsd.DefIndex) => {
				return Q().then(() => {
					var matches:tsd.Def[] = [];
					selector.patterns.forEach((names:NameMatcher) => {
						names.filter(index.list, matches).forEach((def:tsd.Def) => {
							if (!tsd.DefUtil.containsDef(matches, def)) {
								matches.push(def);
							}
						});
					});
					res.nameMatches = matches;
					res.definitions = matches.slice(0);
					if (selector.versionMatcher) {
						res.definitions = selector.versionMatcher.filter(matches);
					}
				}).then(() => {
					if (selector.dateMatcher) {
						return this.content.loadHistoryBulk(res.definitions).progress(d.notify).then(() => {
							//crude reset
							res.selection = [];
							res.definitions.forEach((def:tsd.Def) => {
								var list = selector.dateMatcher.filter(def.history).sort(tsd.DefUtil.fileCommitCompare);
								if (list.length > 0) {
									res.selection.push(list[list.length - 1]);
								}
							});
							res.definitions = tsd.DefUtil.getDefs(res.selection);
						});
					}
					// default to all heads
					res.selection = tsd.DefUtil.getHeads(res.definitions);
					return null;
				}).then(() => {
					if (selector.resolveDependencies) {
						return this.resolver.resolveBulk(res.selection).progress(d.notify);
					}
					return null;
				});
			}).then(() => {
				d.resolve(res);
			}, d.reject).done();

			return d.promise;
		}

		set verbose(verbose:boolean) {
			this.track.logEnabled = verbose;
			this._components.verbose = verbose;
		}
	}

	export interface ITrackable {
		track:xm.EventLog;
		verbose:boolean;
	}

	export class MultiManager {

		private _verbose:boolean = false;

		trackables:tsd.ITrackable[] = [];

		constructor(public core:tsd.Core) {
			xm.assertVar(core, tsd.Core, 'core');
		}

		add(list:any[]) {
			list.forEach((comp) => {
				this.trackables.push(comp);
			});
		}

		set verbose(verbose:boolean) {
			this._verbose = verbose;
			this.trackables.forEach((comp:tsd.ITrackable) => {
				comp.verbose = this._verbose;
			});
		}
	}
}
