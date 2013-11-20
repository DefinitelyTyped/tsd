///<reference path="_ref.ts" />
///<reference path="Core.ts" />
///<reference path="context/Context.ts" />
///<reference path="select/Selector.ts" />
///<reference path="../xm/KeyValueMap.ts" />

module tsd {
	'use strict';

	var path = require('path');
	var util = require('util');
	var Q:typeof Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');

	/*
	 APIResult: hold result data (composition may vary)
	 */
	//TODO consider splitting into more specific result for each command
	//TODO add useful methods to result (wrap some helpers from DefUtils)
	export class APIResult {

		error:string;
		nameMatches:tsd.Def[];
		definitions:tsd.Def[];
		selection:tsd.DefVersion[];
		written:xm.IKeyValueMap<tsd.DefVersion> = new xm.KeyValueMap();
		//removed:xm.KeyValueMap = new xm.KeyValueMap();

		constructor(public selector:tsd.Selector = null) {
			xm.assertVar(selector, tsd.Selector, 'selector', true);
		}
	}

	export class APIMessage {
		message:string;
		tag:string;

		constructor(message:string, tag:string) {
			this.message = message;
			this.tag = tag;
		}

		toString() {
			return this.tag + ':' + this.message;
		}
	}

	export class APIProgress extends APIMessage {
		total:number;
		current:number;

		constructor(message:string, code:string, total:number = 0, current:number = 0) {
			super(message, code);
			this.total = total;
			this.current = current;
		}

		getRatio():number {
			if (this.total > 0) {
				return Math.min(Math.max(0, this.current), this.total) / this.total;
			}
			return 0;
		}

		getPerc():string {
			return Math.round(this.getRatio() * 100) + '%';
		}

		getOf():string {
			return this.current + '/' + this.total;
		}

		toString() {
			return super.toString() + ':';
		}
	}


	/*
	 API: the high-level API used by dependants
	 */
	export class API {

		public core:tsd.Core;
		public track:xm.EventLog;

		constructor(public context:tsd.Context) {
			xm.assertVar(context, tsd.Context, 'context');

			this.core = new tsd.Core(this.context);
			this.track = new xm.EventLog('api', 'API');

			xm.ObjectUtil.lockProps(this, ['core', 'track']);

			this.verbose = this.context.verbose;
		}

		/*
		 create default config file
		 */
		//TODO add some more options
		initConfig(overwrite:boolean = false):Q.Promise<string> {
			var p = this.core.config.initConfig(overwrite);
			this.track.promise(p, 'config_init');
			return p;
		}

		/*
		 read the config from Context.path.configFile
		 */
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
		 list files matching selector
		 */
		search(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var p = this.core.select(selector);
			this.track.promise(p, 'config_search');
			return p;
		}

		/*
		 install all files matching selector
		 */
		install(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();
			this.track.promise(d.promise, 'install');

			//hardcode for now
			//TODO keep and report more info about what was written/ignored, split by selected vs dependencies

			this.core.select(selector).progress(d.notify).then((res:tsd.APIResult) => {
				var files:tsd.DefVersion[] = res.selection;

				files = tsd.DefUtil.mergeDependencies(files);

				return this.core.installer.installFileBulk(files, selector.saveToConfig, selector.overwriteFiles).progress(d.notify).then((written:xm.IKeyValueMap) => {
					if (!written) {
						throw new Error('expected install paths');
					}
					res.written = written;
					if (selector.saveToConfig) {
						return this.core.config.saveConfig().progress(d.notify).then(() => {
							d.resolve(res);
						});
					}
					d.resolve(res);
				});
			}).fail(d.reject).done();

			return d.promise;
		}

		/*
		 direct install from partial commitSha
		 */
		//TODO move into selector? meh?
		installFragment(path:string, commitShaFragment:string):Q.Promise<APIResult> {
			xm.assertVar(path, 'string', 'path');
			var d:Q.Deferred<APIResult> = Q.defer();
			this.track.promise(d.promise, 'install_fragment');

			var res = new tsd.APIResult(null);

			this.core.index.findFile(path, commitShaFragment).progress(d.notify).then((file:tsd.DefVersion) => {
				return this.core.installer.installFile(file).progress(d.notify).then((targetPath:string) => {
					res.written.set(targetPath, file);
					d.resolve(res);
				});
			}).fail(d.reject).done();

			return d.promise;
		}

		/*
		 download selection and parse and display header info
		 */
		info(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();
			this.track.promise(d.promise, 'info');

			this.core.select(selector).progress(d.notify).then((res:tsd.APIResult) => {
				//nest for scope
				return this.core.parser.parseDefInfoBulk(res.selection).progress(d.notify).then(() => {
					d.resolve(res);
				});
			}).fail(d.reject).done();

			return d.promise;
		}

		/*
		 load commit history
		 */
		history(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();
			this.track.promise(d.promise, 'history');

			this.core.select(selector).progress(d.notify).then((res:tsd.APIResult) => {
				// filter Defs from all selected versions
				res.definitions = tsd.DefUtil.getDefs(res.selection);

				//TODO limit history to Selector date filter?
				return this.core.content.loadHistoryBulk(res.definitions).progress(d.notify).then(() => {
					d.resolve(res);
				});
			}).fail(d.reject).done();

			return d.promise;
		}

		/*
		 re-install from config
		 */
		reinstall(overwrite:boolean = false):Q.Promise<APIResult> {
			var res = new tsd.APIResult(null);
			var d:Q.Deferred<APIResult> = Q.defer();
			this.track.promise(d.promise, 'reinstall');

			this.core.installer.reinstallBulk(this.context.config.getInstalled(), overwrite).progress(d.notify).then((map:xm.IKeyValueMap) => {
				res.written = map;
			}).then(() => {
				d.resolve(res);
			}, d.reject).done();

			return d.promise;
		}

		/*
		 compare repo data with local installed file and check for changes
		 */
		//TODO implement compare() command
		compare(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();
			this.track.promise(d.promise, 'compare');
			d.reject(new Error('not implemented yet'));

			return d.promise;
		}

		/*
		 clear caches and temporary files
		 */
		//TODO implement: purge() command
		purge():Q.Promise<APIResult> {
			// add proper safety checks (let's not accidentally rimraf too much)
			var d:Q.Deferred<APIResult> = Q.defer();
			this.track.promise(d.promise, 'purge');
			d.reject(new Error('not implemented yet'));

			return d.promise;
		}

		set verbose(verbose:boolean) {
			this.track.logEnabled = verbose;
			this.core.verbose = verbose;
		}
	}
}
