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
import DefCommit = require('./data/DefCommit');
import defUtil = require('./util/defUtil');

import Query = require('./select/Query');
import Selection = require('./select/Selection');
import VersionMatcher = require('./select/VersionMatcher');

import InstallResult = require('./logic/InstallResult');
import GitRateInfo = require('../git/model/GithubRateInfo');

import Options = require('./Options');
import Core = require('./logic/Core');

import PackageLinker = require('./support/PackageLinker');
import PackageDefinition = require('./support/PackageDefinition');
import BundleManager = require('./support/BundleManager');
import BundleChange = require('./support/BundleChange');

/*
 API: the high-level API used by dependants
 */
class API {

	core: Core;

	constructor(public context: Context) {
		assertVar(context, Context, 'context');

		this.core = new Core(this.context);
	}

	/*
	 create default config file
	 */
	// TODO add some more options
	initConfig(overwrite: boolean): Promise<string[]> {
		return this.core.config.initConfig(overwrite).then((configPath) => {
			configPath = path.relative(process.cwd(), configPath);

			if (!this.context.config.bundle) {
				return Promise.resolve([configPath]);
			}
			var manager = new BundleManager(this.core.context.getTypingsDir());
			return manager.saveEmptyBundle(this.context.config.bundle).then(() => {
				return [configPath, path.relative(process.cwd(), this.context.config.bundle)];
			}, () => {
				return [configPath];
			});
		});
	}

	/*
	 read the config from Context.path.configFile
	 */
	// TODO add some more options
	readConfig(optional: boolean): Promise<void> {
		return this.core.config.readConfig(optional);
	}

	/*
	 save the config to Context.path.configFile
	 */
	saveConfig(): Promise<string> {
		return this.core.config.saveConfig();
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
			.then((written: collection.Hash<DefVersion>) => {
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
				return this.saveBundles(res.written.values(), options);
			}).return(res);
	}

	/*
	 helper saves files to bundles
	 */
	private saveBundles(files: DefVersion[], options: Options): Promise<void> {
		assertVar(files, 'array', 'files');
		assertVar(options, Options, 'options', true);
		options = options || Options.main;

		if (files.length === 0) {
			return Promise.resolve();
		}

		var refs: string[] = [];
		files.forEach((file: DefVersion) => {
			refs.push(file.def.path);
		});
		refs.sort();

		var basePath = path.dirname(this.context.paths.configFile);
		var manager = new BundleManager(this.core.context.getTypingsDir());

		var bundles: string[] = [];
		if (options.addToBundles) {
			options.addToBundles.forEach((bundle: string) => {
				bundle = path.resolve(basePath, bundle);
				if (!/\.ts$/.test(bundle)) {
					bundle += '.d.ts';
				}
				bundles.push(bundle);
			});
		}

		if ((options.saveToConfig || options.saveBundle) && this.context.config.bundle) {
			bundles.push(path.resolve(basePath, this.context.config.bundle));
		}

		return Promise.map(bundles, (target: string) => {
			return manager.addToBundle(target, refs, true);
		}).return();
	}

	/*
	 re-install from config
	 */
	reinstall(options?: Options): Promise<InstallResult> {
		var res = new InstallResult(options);

		return this.core.installer.reinstallBulk(this.context.config.getInstalled(), options.overwriteFiles)
			.then((map: collection.Hash<DefVersion>) => {
				res.written = map;
			}).then(() => {
				if (options.saveToConfig) {
					return this.core.config.saveConfig();
				}
				return null;
			}).then(() => {
				return this.saveBundles(res.written.values(), options);
			}).then(() => {
				this.core.installer.removeUnusedReferences(
					this.context.config.getInstalled(), this.core.context.config.toJSON().path).then((removedList: string[]) => {
						options.saveBundle = true;
						return this.saveBundles(this.context.config.getInstalledAsDefVersionList(), options);
					});
			}).return(res);
	}

	/*
	 update from config
	 */
	update(options?: Options, version: string = 'latest'): Promise<InstallResult> {

		var query = new Query();
		this.context.config.getInstalled().forEach((inst: InstalledDef) => {
			query.addNamePattern(new Def(inst.path).pathTerm);
		});
		query.versionMatcher = new VersionMatcher(version);

		return this.select(query, options).then((selection: Selection) => {
			return this.install(selection, options);
		});
	}

	link(baseDir: string): Promise<PackageDefinition[]> {
		assertVar(baseDir, 'string', 'baseDir');

		var linker = new PackageLinker();
		var manager = new BundleManager(this.core.context.getTypingsDir());

		return linker.scanDefinitions(baseDir).then((packages) => {
			return Promise.reduce(packages, (memo: PackageDefinition[], packaged) => {
				return manager.addToBundle(this.context.config.bundle, packaged.definitions, true).then((change) => {
					if (change.someAdded()) {
						memo.push(packaged);
					}
					return memo;
				});
			}, []);
		});
	}

	addToBundle(target: string, refs: string[], save: boolean): Promise<BundleChange> {
		var manager = new BundleManager(this.core.context.getTypingsDir());
		return manager.addToBundle(target, refs, save);
	}

	cleanupBundle(target: string, save: boolean): Promise<BundleChange> {
		var manager = new BundleManager(this.core.context.getTypingsDir());
		return manager.cleanupBundle(target, save);
	}

	updateBundle(target: string, save: boolean): Promise<BundleChange> {
		var manager = new BundleManager(this.core.context.getTypingsDir());
		return manager.updateBundle(target, save);
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
			if (file.def.head && file.commit.commitSha === file.def.head.commit.commitSha) {
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
			return Promise.resolve(file);
		}).then((list) => {
			return list.reduce((memo: string[], file: DefVersion) => {
				var urls;
				if (file.info && file.info.projects) {
					urls = file.info.projects;
				}
				else if (file.def.head.info && file.def.head.info.projects) {
					urls = file.def.head.info.projects;
				}
				if (urls) {
					urls.forEach((url) => {
						memo.push(url);
						openInApp(url);
					});
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
}

export = API;
