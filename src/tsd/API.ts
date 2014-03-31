/// <reference path="./_ref.d.ts" />

'use strict';

require('../bootstrap');

import path = require('path');
import util = require('util');
import Promise = require('bluebird');

import openInApp = require('open');

import assertVar = require('../xm/assertVar');
import collection = require('../xm/collection');
import objectUtils = require('../xm/objectUtils');

import Context = require('./context/Context');
import InstalledDef = require('./context/InstalledDef');

import Def = require('./data/Def');
import DefVersion = require('./data/DefVersion');
import defUtil = require('./util/defUtil');

import Query = require('./select/Query');
import Selection = require('./select/Selection');
import VersionMatcher = require('./select/VersionMatcher');

import InstallResult = require('./logic/InstallResult');
import GitRateInfo = require('../git/model/GithubRateInfo');

import Options = require('./Options');
import Core = require('./logic/Core');

/*
 API: the high-level API used by dependants
 */
class API {

	core: Core;

	constructor(public context: Context) {
		assertVar(context, Context, 'context');

		this.core = new Core(this.context);

		this.verbose = this.context.verbose;
	}

	/*
	 create default config file
	 */
	// TODO add some more options
	initConfig(overwrite: boolean): Promise<string> {
		var p = this.core.config.initConfig(overwrite);
		return p;
	}

	/*
	 read the config from Context.path.configFile
	 */
	// TODO add some more options
	readConfig(optional: boolean): Promise<void> {
		var p = this.core.config.readConfig(optional);
		return p;
	}

	/*
	 save the config to Context.path.configFile
	 */
	saveConfig(): Promise<string> {
		var p = this.core.config.saveConfig();
		return p;
	}

	/*
	 list files matching query
	 */
	select(query: Query, options?: Options): Promise<Selection> {
		assertVar(query, Query, 'query');
		assertVar(options, Options, 'options', true);
		options = options || Options.main;

		return this.core.selector.select(query, options);
	}

	/*
	 install all files matching query
	 */
	install(selection: Selection, options?: Options): Promise<InstallResult> {
		assertVar(selection, Selection, 'selection');
		assertVar(options, Options, 'options', true);
		options = options || Options.main;

		// TODO keep and report more info about what was written/ignored, split by selected vs dependencies

		var res = new InstallResult(options);
		var files: DefVersion[] = defUtil.mergeDependencies(selection.selection);

		return this.core.installer.installFileBulk(files, options.saveToConfig, options.overwriteFiles)
		.then((written: Map<string, DefVersion>) => {
			if (!written) {
				throw new Error('expected install paths');
			}
			res.written = written;
		}).then(() => {
			if (options.saveToConfig) {
				return this.core.config.saveConfig();
			}
			return null;
		}).then(() => {
			return this.saveBundles(collection.valuesOf(res.written), options);
		}).return(res);
	}

	/*
	 helper saves files to bundles
	 */
	private saveBundles(files: DefVersion[], options: Options): Promise<void> {
		assertVar(files, 'array', 'files');
		assertVar(options, Options, 'options', true);
		options = options || Options.main;

		var bundles: string[] = [];
		if (options.addToBundles) {
			options.addToBundles.forEach((bundle: string) => {
				bundle = path.join(this.context.config.path, bundle);
				if (!/\.ts$/.test(bundle)) {
					bundle += '.d.ts';
				}
				bundles.push(bundle);
			});
		}
		var refs: string[] = [];
		files.forEach((file: DefVersion) => {
			refs.push(file.def.path);
		});

		return Promise.map(bundles, (target: string) => {
			return this.core.bundle.addToBundle(target, refs, true);
		}).then(() => {
			// TODO re-use config var?
			if (options.saveToConfig && this.context.config.bundle) {
				// no progress?
				return this.core.bundle.addToBundle(this.context.config.bundle, refs, true);
			}
		}).return();
	}

	/*
	 re-install from config
	 */
	reinstall(options?: Options): Promise<InstallResult> {
		var res = new InstallResult(options);

		return this.core.installer.reinstallBulk(this.context.config.getInstalled(), options.overwriteFiles)
		.then((map: Map<string, DefVersion>) => {
			res.written = map;
		}).then(() => {
			if (options.saveToConfig) {
				return this.core.config.saveConfig();
			}
			return null;
		}).then(() => {
			return this.saveBundles(collection.valuesOf(res.written), options);
		}).return(res);
	}

	/*
	 update from config
	 */
	update(options?: Options, version: string = 'latest'): Promise<InstallResult> {

		var query = new Query();
		this.context.config.getInstalled().forEach((inst: InstalledDef) => {
			query.addNamePattern(Def.getFrom(inst.path).pathTerm);
		});
		query.versionMatcher = new VersionMatcher(version);

		return this.select(query, options).then((selection: Selection) => {
			return this.install(selection, options);
		});
	}

	/*
	 get rate-info
	 */
	getRateInfo(): Promise<GitRateInfo> {
		return this.core.repo.api.getRateInfo();
	}

	/*
	 compare repo data with local installed file and check for changes
	 */
	// TODO implement compare() command
	compare(query: Query): Promise<void> {
		assertVar(query, Query, 'query');
		return Promise.reject(new Error('not implemented yet'));
	}

	/*
	 browse selection in browser
	 */
	browse(list: DefVersion[]): Promise<string[]> {
		assertVar(list, 'array', 'list');

		if (list.length > 2) {
			return Promise.reject(new Error('to many results to open in browser'));
		}

		return Promise.resolve(list.map((file: DefVersion) => {
			var ref = file.commit.commitSha;
			// same?
			if (file.commit.commitSha === file.def.head.commit.commitSha) {
				ref = this.core.context.config.ref;
			}
			var url = this.core.repo.urls.htmlFile(ref, file.def.path);
			openInApp(url);
			return url;
		}));
	}

	/*
	 visit selection's project-url in browser
	 */
	visit(list: DefVersion[]): Promise<string[]> {
		assertVar(list, 'array', 'list');

		if (list.length > 2) {
			return Promise.reject(new Error('to many results to open in browser'));
		}

		return Promise.map(list, (file: DefVersion) => {
			if (!file.info) {
				return this.core.parser.parseDefInfo(file);
			}
			return Promise.cast(file);
		}).then((list) => {
			return list.reduce((memo:string[],  file: DefVersion) => {
				var url;
				if (file.info && file.info.projectUrl) {
					url = file.info.projectUrl;
				}
				else if (file.def.head.info && file.def.head.info.projectUrl) {
					url = file.def.head.info.projectUrl;
				}
				if (url) {
					memo.push(url);
					openInApp(url);
				}
				return memo;
			}, []);
		});
	}

	/*
	 clear caches and temporary files
	 */
	purge(raw: boolean, api: boolean): Promise<void> {
		// add proper safety checks (let's not accidentally rimraf too much)
		var queue = [];
		if (raw) {
			queue.push(this.core.repo.raw.cache.cleanupCacheAge(0));
		}
		if (api) {
			queue.push(this.core.repo.api.cache.cleanupCacheAge(0));
		}
		return Promise.all(queue).return();
	}

	set verbose(verbose: boolean) {
		this.core.verbose = verbose;
	}
}

export = API;
