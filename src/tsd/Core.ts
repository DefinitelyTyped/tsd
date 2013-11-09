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

		constructor(public context:tsd.Context) {
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
		//TODO why promise APIResult here?
		select(selector:Selector):Q.Promise<APIResult> {
			var d:Q.Deferred<APIResult> = Q.defer();

			this.index.getIndex().then((index:tsd.DefIndex) => {
				var res = new APIResult(index, selector);

				res.nameMatches = selector.pattern.filter(index.list);
				// default to all heads
				res.selection = tsd.DefUtil.getHeads(res.nameMatches);
				//res.definitions = res.nameMatches.slice(0);

				return Q(() => {
					//TODO apply some more filters in steps? or find better selection model (no god-method but iterative)
					if (selector.resolveDependencies) {
						return this.resolver.resolveBulk(res.selection);
					}
					return;
				}).then(() => {
					d.resolve(res);
				});
			}).fail(d.reject);

			return d.promise;
		}

		set verbose(verbose:boolean) {
			this.track.logEnabled = value;
			this._components.verbose = verbose;
		}
	}

	export interface ITrackable {
		track:xm.EventLog;
	}

	export class MultiManager {

		private _verbose:boolean = false;

		trackables:tsd.ITrackable[] = [];

		constructor(public core:tsd.Core) {
			xm.assertVar(core, tsd.Core, 'core');
		}

		add(list:any[]) {
			list.forEach((comp) => {
				if (comp.track && comp.track instanceof xm.EventLog) {
					this.trackables.push(comp);
				}
			})
		}

		set verbose(value:boolean) {
			this._verbose = value;
			this.trackables.forEach((item:tsd.ITrackable) => {
				item.track.logEnabled = this._verbose;
			})
		}
	}
}
