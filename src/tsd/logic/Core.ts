/// <reference path="../_ref.d.ts" />

'use strict';

// TODO get rid of hacky updateConfig()

import path = require('path');
import Promise = require('bluebird');

import assertVar = require('../../xm/assertVar');
import objectUtils = require('../../xm/objectUtils');
import CacheMode = require('../../xm/http/CacheMode');
import eventLog = require('../../xm/lib/eventLog');

import GithubRepo = require('../../git/GithubRepo');

import Context = require('../context/Context');

import Def = require('../data/Def');

import ITrackable = require('./ITrackable');
import IndexManager = require('./IndexManager');
import SelectorQuery = require('./SelectorQuery');
import ConfigIO = require('./ConfigIO');
import ContentLoader = require('./ContentLoader');
import InfoParser = require('./InfoParser');
import Installer = require('./Installer');
import Resolver = require('./Resolver');
import BundleManager = require('./BundleManager');


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var leadingExp = /^\.\.\//;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/*
 Core: operational core logics
 */
class Core {

	context: Context;
	repo: GithubRepo;

	index: IndexManager;
	selector: SelectorQuery;
	config: ConfigIO;
	content: ContentLoader;
	parser: InfoParser;
	installer: Installer;
	resolver: Resolver;
	bundle: BundleManager;

	private _components: MultiManager;
	private _cacheMode: string;

	constructor(context: Context) {
		assertVar(context, Context, 'context');
		this.context = context;

		this._components = new MultiManager(this);
		this._components.add([
			this.index = new IndexManager(this),
			this.config = new ConfigIO(this),
			this.selector = new SelectorQuery(this),
			this.content = new ContentLoader(this),
			this.parser = new InfoParser(this),
			this.installer = new Installer(this),
			this.resolver = new Resolver(this),
			this.bundle = new BundleManager(this)
		]);

		this.updateConfig();

		this.verbose = this.context.verbose;
	}

	updateConfig(): void {
		// drop statefull helper
		this._components.replace({
			repo: new GithubRepo(this.context.config, this.context.paths.cacheDir, this.context.settings)
		});

		// lets be gents
		this.repo.api.headers['user-agent'] = this.context.packageInfo.getNameVersion();
		this.repo.raw.headers['user-agent'] = this.context.packageInfo.getNameVersion();

		this.useCacheMode(this._cacheMode);
	}

	getInstallPath(def: Def): string {
		return path.join(this.context.getTypingsDir(), def.path.replace(/[//\/]/g, path.sep));
	}

	useCacheMode(modeName: string): void {
		this._cacheMode = modeName;

		if (modeName in CacheMode) {
			var mode = CacheMode[modeName];
			this.repo.api.cache.opts.applyCacheMode(mode);
			this.repo.raw.cache.opts.applyCacheMode(mode);
		}
	}

	set verbose(verbose: boolean) {
		this._components.verbose = verbose;
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class MultiManager {

	private _verbose: boolean = false;

	trackables = new Set<ITrackable>();

	constructor(public core: Core) {
		assertVar(core, Core, 'core');
	}

	add(list: any[]) {
		list.forEach((comp) => {
			this.trackables.add(comp);
		});
	}

	remove(list: any[]) {
		while (list.length > 0) {
			this.trackables.delete(list.pop());
		}
	}

	replace(fields: Object): void {
		Object.keys(fields).forEach((property: string) => {
			this.trackables.delete(this.core[property]);
			var trackable = fields[property];
			if (!this.core[property]) {
				this.core[property] = trackable;
			}
			trackable.verbose = this._verbose;
			this.trackables.add(fields[property]);
		});
	}

	set verbose(verbose: boolean) {
		this._verbose = verbose;
		this.trackables.forEach((comp: ITrackable) => {
			comp.verbose = this._verbose;
		});
	}
}

export = Core;
