/// <reference path="../_ref.d.ts" />

'use strict';

// TODO get rid of hacky updateConfig()

import path = require('path');
import Promise = require('bluebird');
import VError = require('verror');

import collection = require('../../xm/collection');
import assertVar = require('../../xm/assertVar');
import objectUtils = require('../../xm/objectUtils');
import eventLog = require('../../xm/lib/eventLog');
import typeOf = require('../../xm/typeOf');

import CacheMode = require('../../http/CacheMode');

import GithubRepo = require('../../git/GithubRepo');

import Context = require('../context/Context');

import CoreModule = require('./CoreModule');

import IndexManager = require('./IndexManager');
import SelectorQuery = require('./SelectorQuery');
import ConfigIO = require('./ConfigIO');
import ContentLoader = require('./ContentLoader');
import InfoParser = require('./InfoParser');
import Installer = require('./Installer');
import Resolver = require('./Resolver');
import BundleManager = require('./BundleManager');

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

	private _apiCacheMode: string = CacheMode[CacheMode.allowUpdate];
	private _rawCacheMode: string = CacheMode[CacheMode.allowUpdate];

	constructor(context: Context) {
		assertVar(context, Context, 'context');
		this.context = context;

		this.index = new IndexManager(this);
		this.config = new ConfigIO(this);
		this.selector = new SelectorQuery(this);
		this.content = new ContentLoader(this);
		this.parser = new InfoParser(this);
		this.installer = new Installer(this);
		this.resolver = new Resolver(this);
		this.bundle = new BundleManager(this);

		this.updateConfig();
	}

	updateConfig(): void {
		// drop statefull helper
		this.repo = new GithubRepo(this.context.config, this.context.paths.cacheDir, this.context.settings);

		// lets be gents
		this.repo.api.headers['user-agent'] = this.context.packageInfo.getNameVersion();
		this.repo.raw.headers['user-agent'] = this.context.packageInfo.getNameVersion();

		var token = this.context.settings.getValue('/token');
		if (typeOf.isString(token)) {
			this.repo.api.headers['authorization'] = 'token ' + token;
		}
		else {
			delete this.repo.api.headers['authorization'];
		}

		this.useCacheMode(this._apiCacheMode, this._rawCacheMode);
	}

	useCacheMode(modeName: string, rawMode?: string): void {
		if (!(modeName in CacheMode)) {
			throw new Error('invalid CacheMode' + modeName);
		}
		if (rawMode && !(rawMode in CacheMode)) {
			throw new Error('invalid CacheMode ' + rawMode);
		}

		this._apiCacheMode = modeName;
		this._rawCacheMode = (rawMode || modeName);

		// pow pow pow
		this.repo.api.cache.opts.cache.applyCacheMode(CacheMode[this._apiCacheMode]);
		this.repo.raw.cache.opts.cache.applyCacheMode(CacheMode[this._rawCacheMode]);
	}
}

export = Core;
