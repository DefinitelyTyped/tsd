/// <reference path="_ref.ts" />
/// <reference path="Core.ts" />
/// <reference path="context/Context.ts" />
/// <reference path="select/Query.ts" />

module tsd {
	'use strict';

	var path = require('path');
	var util = require('util');
	var Q:typeof Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var openInApp = require('open');

	export class InstallResult {

		options:tsd.Options;
		written:Map<string, tsd.DefVersion> = new Map();
		removed:Map<string, tsd.DefVersion> = new Map();
		skipped:Map<string, tsd.DefVersion> = new Map();

		constructor(options:tsd.Options) {
			xm.assertVar(options, tsd.Options, 'options');
			this.options = options;
		}
	}

	export class CompareResult {

	}

	/*
	 API: the high-level API used by dependants
	 */
	export class API {

		core:tsd.Core;
		track:xm.EventLog;

		constructor(public context:tsd.Context) {
			xm.assertVar(context, tsd.Context, 'context');

			this.core = new tsd.Core(this.context);
			this.track = new xm.EventLog('api', 'API');
			this.track.unmuteActions([xm.EventLevel.notify]);

			xm.object.lockProps(this, ['core', 'track']);

			this.verbose = this.context.verbose;
		}

		/*
		 create default config file
		 */
		// TODO add some more options
		initConfig(overwrite:boolean):Q.Promise<string> {
			var p = this.core.config.initConfig(overwrite);
			this.track.promise(p, 'config_init');
			return p;
		}

		/*
		 read the config from Context.path.configFile
		 */
		// TODO add some more options
		readConfig(optional:boolean):Q.Promise<void> {
			var p = this.core.config.readConfig(optional);
			this.track.promise(p, 'config_read');
			return p;
		}

		/*
		 save the config to Context.path.configFile
		 */
		saveConfig():Q.Promise<string> {
			var p = this.core.config.saveConfig();
			this.track.promise(p, 'config_save');
			return p;
		}

		/*
		 list files matching query
		 */
		select(query:tsd.Query, options?:tsd.Options):Q.Promise<tsd.Selection> {
			xm.assertVar(query, tsd.Query, 'query');
			xm.assertVar(options, tsd.Options, 'options', true);
			options = options || Options.main;

			var p = this.core.selector.select(query, options);
			this.track.promise(p, 'select');
			return p;
		}

		/*
		 install all files matching query
		 */
		install(selection:tsd.Selection, options?:tsd.Options):Q.Promise<tsd.InstallResult> {
			xm.assertVar(selection, tsd.Selection, 'selection');
			xm.assertVar(options, tsd.Options, 'options', true);
			options = options || Options.main;

			var d:Q.Deferred<tsd.InstallResult> = Q.defer();
			this.track.promise(d.promise, 'install');

			// TODO keep and report more info about what was written/ignored, split by selected vs dependencies

			var res = new tsd.InstallResult(options);
			var files:tsd.DefVersion[] = tsd.DefUtil.mergeDependencies(selection.selection);

			this.core.installer.installFileBulk(files, options.saveToConfig, options.overwriteFiles)
				.progress(d.notify).then((written:Map<string, tsd.DefVersion>) => {
					if (!written) {
						throw new Error('expected install paths');
					}
					res.written = written;
				}).then(() => {
					if (options.saveToConfig) {
						return this.core.config.saveConfig().progress(d.notify);
					}
					return null;
				}).then(() => {
					return this.saveBundles(xm.valuesOf(res.written), options).progress(d.notify);
				}).then(() => {
					d.resolve(res);
				}, d.reject);

			return d.promise;
		}

		/*
		 helper saves files to bundles
		 */
		private saveBundles(files:tsd.DefVersion[], options:tsd.Options):Q.Promise<void> {
			xm.assertVar(files, 'array', 'files');
			xm.assertVar(options, tsd.Options, 'options', true);
			options = options || Options.main;

			var d:Q.Deferred<void> = Q.defer();
			this.track.promise(d.promise, 'bundle_save');

			var bundles:string[] = [];
			if (options.addToBundles) {
				options.addToBundles.forEach((bundle:string) => {
					bundle = path.join(this.context.config.path, bundle);
					if (!/\.ts$/.test(bundle)) {
						bundle += '.d.ts';
					}
					bundles.push(bundle);
				});
			}
			var refs:string[] = [];
			files.forEach((file:tsd.DefVersion) => {
				refs.push(file.def.path);
			});

			Q.all(bundles.map((target:string) => {
				return this.core.bundle.addToBundle(target, refs, true).progress(d.notify);
			})).then(() => {
				// TODO re-use config var?
				if (options.saveToConfig && this.context.config.bundle) {
					// no progress?
					return this.core.bundle.addToBundle(this.context.config.bundle, refs, true);
				}
			}).then(() => {
				d.resolve();
			}, d.reject);

			return d.promise;
		}

		/*
		 re-install from config
		 */
		reinstall(options?:tsd.Options):Q.Promise<tsd.InstallResult> {
			var d:Q.Deferred<tsd.InstallResult> = Q.defer();
			this.track.promise(d.promise, 'reinstall');

			var res = new tsd.InstallResult(options);

			this.core.installer.reinstallBulk(this.context.config.getInstalled(), options.overwriteFiles)
				.progress(d.notify).then((map:Map<string, tsd.DefVersion>) => {
					res.written = map;
				}).then(() => {
					if (options.saveToConfig) {
						return this.core.config.saveConfig().progress(d.notify);
					}
					return null;
				}).then(() => {
					return this.saveBundles(xm.valuesOf(res.written), options).progress(d.notify);
				}).then(() => {
					d.resolve(res);
				}, d.reject);

			return d.promise;
		}

		/*
		 update from config
		 */
		update(options?:tsd.Options, version:string = 'latest'):Q.Promise<tsd.InstallResult> {
			var d:Q.Deferred<tsd.InstallResult> = Q.defer();
			this.track.promise(d.promise, 'update');

			var query = new tsd.Query();
			this.context.config.getInstalled().forEach((inst:tsd.InstalledDef) => {
				query.addNamePattern(tsd.Def.getFrom(inst.path).pathTerm);
			});
			query.versionMatcher = new tsd.VersionMatcher(version);

			this.select(query, options).progress(d.notify).then((selection:tsd.Selection) => {
				return this.install(selection, options).progress(d.notify).then((res:tsd.InstallResult) => {
					d.resolve(res);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 get rate-info
		 */
		getRateInfo():Q.Promise<git.GitRateInfo> {
			var p = this.core.repo.api.getRateInfo();
			this.track.promise(p, 'rate_info');
			return p;
		}

		/*
		 compare repo data with local installed file and check for changes
		 */
		// TODO implement compare() command
		compare(query:tsd.Query):Q.Promise<CompareResult> {
			xm.assertVar(query, tsd.Query, 'query');
			var d:Q.Deferred<CompareResult> = Q.defer();
			this.track.promise(d.promise, 'compare');
			d.reject(new Error('not implemented yet'));

			return d.promise;
		}

		/*
		 browse selection in browser
		 */
		browse(list:tsd.DefVersion[]):Q.Promise<string[]> {
			xm.assertVar(list, 'array', 'list');

			var d:Q.Deferred<string[]> = Q.defer();
			this.track.promise(d.promise, 'browse');
			if (list.length > 2) {
				d.reject(new Error('to many results to open in browser'));
				return d.promise;
			}

			var opened = [];

			list.forEach((file:tsd.DefVersion) => {
				var ref = file.commit.commitSha;
				// same?
				if (file.commit.commitSha === file.def.head.commit.commitSha) {
					ref = this.core.context.config.ref;
				}
				var url = this.core.repo.urls.htmlFile(ref, file.def.path);
				opened.push(url);
				openInApp(url);
			});
			d.resolve(opened);

			return d.promise;
		}

		/*
		 visit selection's project-url in browser
		 */
		visit(list:tsd.DefVersion[]):Q.Promise<string[]> {
			xm.assertVar(list, 'array', 'list');

			var d:Q.Deferred<string[]> = Q.defer();
			this.track.promise(d.promise, 'visit');
			if (list.length > 2) {
				d.reject(new Error('to many results to open in browser'));
				return d.promise;
			}

			var opened = [];

			Q.all(list.map((file:tsd.DefVersion) => {
				if (!file.info) {
					return this.core.parser.parseDefInfo(file).progress(d.notify);
				}
				return Q(file);
			})).then(() => {
				list.forEach((file:tsd.DefVersion) => {
					var url;
					if (file.info && file.info.projectUrl) {
						url = file.info.projectUrl;
					}
					else if (file.def.head.info && file.def.head.info.projectUrl) {
						url = file.def.head.info.projectUrl;
					}
					if (url) {
						opened.push(url);
						openInApp(url);
					}
				});
				d.resolve(opened);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 clear caches and temporary files
		 */
		purge(raw:boolean, api:boolean):Q.Promise<void> {
			// add proper safety checks (let's not accidentally rimraf too much)
			var d:Q.Deferred<void> = Q.defer();
			this.track.promise(d.promise, 'purge');
			var queue = [];

			if (raw) {
				queue.push(this.core.repo.raw.cache.cleanupCacheAge(0).progress(d.notify));
			}
			if (api) {
				queue.push(this.core.repo.api.cache.cleanupCacheAge(0).progress(d.notify));
			}

			// run?
			if (queue.length > 0) {
				Q.all(queue).done(() => {
					d.resolve();
				}, d.reject);
			}
			else {
				d.resolve();
			}

			return d.promise;
		}

		set verbose(verbose:boolean) {
			this.track.logEnabled = verbose;
			this.core.verbose = verbose;
		}
	}
}
