/// <reference path="../git/GithubRepo.ts" />
/// <reference path="../xm/assertVar.ts" />

/// <reference path="context/Config.ts" />

/// <reference path="Options.ts" />
/// <reference path="logic/SubCore.ts" />
/// <reference path="logic/Resolver.ts" />
/// <reference path="logic/IndexManager.ts" />
/// <reference path="logic/ConfigIO.ts" />
/// <reference path="logic/ContentLoader.ts" />
/// <reference path="logic/Installer.ts" />
/// <reference path="logic/InfoParser.ts" />
/// <reference path="logic/ContentLoader.ts" />
/// <reference path="logic/SelectorQuery.ts" />
/// <reference path="logic/BundleManager.ts" />
/// <reference path="select/Query.ts" />

/// <reference path="API.ts" />

// TODO get rid of hacky updateConfig()
module tsd {
	'use strict';

	var Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var path = require('path');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var leadingExp = /^\.\.\//;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	/*
	 Core: operational core logics
	 */
	export class Core {

		context:tsd.Context;
		repo:git.GithubRepo;

		index:tsd.IndexManager;
		selector:tsd.SelectorQuery;
		config:tsd.ConfigIO;
		content:tsd.ContentLoader;
		parser:tsd.InfoParser;
		installer:tsd.Installer;
		resolver:tsd.Resolver;
		bundle:tsd.BundleManager;

		track:xm.EventLog;

		_components:tsd.MultiManager;
		_cacheMode:string;

		constructor(context:tsd.Context) {
			xm.assertVar(context, tsd.Context, 'context');
			this.context = context;

			this.track = new xm.EventLog('core', 'Core');

			this._components = new tsd.MultiManager(this);
			this._components.add([
				this.index = new tsd.IndexManager(this),
				this.config = new tsd.ConfigIO(this),
				this.selector = new tsd.SelectorQuery(this),
				this.content = new tsd.ContentLoader(this),
				this.parser = new tsd.InfoParser(this),
				this.installer = new tsd.Installer(this),
				this.resolver = new tsd.Resolver(this),
				this.bundle = new tsd.BundleManager(this)
			]);

			this.updateConfig();

			this.verbose = this.context.verbose;

			xm.object.hidePrefixed(this);
			xm.object.lockProps(this, Object.keys(this), true, false);
		}

		updateConfig():void {
			// drop statefull helper
			this._components.replace({
				repo: new git.GithubRepo(this.context.config, this.context.paths.cacheDir, this.context.settings)
			});

			// lets be gents
			this.repo.api.headers['user-agent'] = this.context.packageInfo.getNameVersion();
			this.repo.raw.headers['user-agent'] = this.context.packageInfo.getNameVersion();

			var token = this.context.settings.getValue('/token');
			if (xm.isString(token)) {
				this.repo.api.headers['authorization'] = 'token ' + token;
			}
			else {
				delete this.repo.api.headers['authorization'];
			}

			this.useCacheMode(this._cacheMode);
		}

		getInstallPath(def:tsd.Def):string {
			return path.join(this.context.getTypingsDir(), def.path.replace(/[//\/]/g, path.sep));
		}

		useCacheMode(modeName:string):void {
			this._cacheMode = modeName;

			if (modeName in xm.http.CacheMode) {
				var mode = xm.http.CacheMode[modeName];
				this.repo.api.cache.opts.applyCacheMode(mode);
				this.repo.raw.cache.opts.applyCacheMode(mode);
			}
		}

		set verbose(verbose:boolean) {
			this.track.logEnabled = verbose;
			this._components.verbose = verbose;
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export interface ITrackable {
		track:xm.EventLog;
		verbose:boolean;
	}

	export class MultiManager {

		private _verbose:boolean = false;

		trackables:Set<tsd.ITrackable> = new Set();

		constructor(public core:tsd.Core) {
			xm.assertVar(core, tsd.Core, 'core');
		}

		add(list:any[]) {
			list.forEach((comp) => {
				this.trackables.add(comp);
			});
		}

		remove(list:any[]) {
			while (list.length > 0) {
				this.trackables.delete(list.pop());
			}
		}

		replace(fields:Object):void {
			Object.keys(fields).forEach((property:string) => {
				this.trackables.delete(this.core[property]);
				var trackable = fields[property];
				if (!this.core[property]) {
					this.core[property] = trackable;
				}
				Object.defineProperty(this.core, property, {value: trackable, writable: false});
				trackable.verbose = this._verbose;
				this.trackables.add(fields[property]);
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
