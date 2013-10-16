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
	 APIResult: hold result data (composition and meaning may vary)
	 */
	//TODO consider splitting into more specific result for each command
	//TODO add useful methods to result (wrap some helpers from DefUtils)
	export class APIResult {

		error:string;
		nameMatches:tsd.Def[];
		selection:tsd.DefVersion[];
		definitions:tsd.Def[];
		written:xm.IKeyValueMap<tsd.DefVersion> = new xm.KeyValueMap();
		//removed:xm.KeyValueMap = new xm.KeyValueMap();

		constructor(public index:DefIndex, public selector:tsd.Selector = null) {
			xm.assertVar(index, DefIndex, 'index');
			xm.assertVar(selector, tsd.Selector, 'selector', true);
		}
	}

	/*
	 API: the high-level API used by dependants
	 */
	export class API {

		private _core:Core;
		private _debug:boolean = false;

		constructor(public context:tsd.Context) {
			xm.assertVar(context, tsd.Context, 'context');

			this._core = new tsd.Core(this.context);

			xm.ObjectUtil.hidePrefixed(this);
		}

		/*
		 read the config from Context.path.configFile
		 */
		readConfig(optional:boolean):Q.Promise<void> {
			var d:Q.Deferred<void> = Q.defer();

			this._core.readConfig(optional).then(() => {
				d.resolve(undefined);
			}, d.reject);

			return d.promise;
		}

		/*
		 save the config to Context.path.configFile
		 */
		saveConfig():Q.Promise<void> {
			var d:Q.Deferred<void> = Q.defer();

			this._core.saveConfig().then(() => {
				d.resolve(undefined);
			}, d.reject);

			return d.promise;
		}

		/*
		 list files matching selector
		 */
		search(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();

			this._core.select(selector).then(d.resolve, d.reject);

			return d.promise;
		}

		/*
		 install all files matching selector
		 */
		install(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();

			//hardcode for now
			//TODO make resolveDependencies a proper cli option
			selector.resolveDependencies = true;

			//TODO keep and report more info about what was written/ignored, split by selected vs dependencies

			this._core.select(selector).then((res:tsd.APIResult) => {
				var files:tsd.DefVersion[] = res.selection;

				//TODO dependency merge should be optional
				files = tsd.DefUtil.mergeDependencies(files);

				return this._core.installFileBulk(files).then((written:xm.IKeyValueMap) => {
					if (!written) {
						throw new Error('expected install paths');
					}
					res.written = written;

					//TODO saving config should be optional
					return this._core.saveConfig().then(() => {
						d.resolve(res);
					});
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 direct install attempt
		 */
		directInstall(path:string, commitSha:string):Q.Promise<APIResult> {
			xm.assertVar(path, 'string', 'path');
			xm.assertVar(commitSha, 'sha1', 'commitSha');
			var d:Q.Deferred<APIResult> = Q.defer();

			var res = new tsd.APIResult(this._core.index, null);

			this._core.procureFile(path, commitSha).then((file:tsd.DefVersion) => {
				return this._core.installFile(file).then((targetPath:string) => {
					res.written.set(targetPath, file);
					d.resolve(res);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 direct install from partial commitSha
		 */
		//TODO move into selector? meh?
		installFragment(path:string, commitShaFragment:string):Q.Promise<APIResult> {
			xm.assertVar(path, 'string', 'path');
			var d:Q.Deferred<APIResult> = Q.defer();

			var res = new tsd.APIResult(this._core.index, null);

			this._core.findFile(path, commitShaFragment).then((file:tsd.DefVersion) => {
				return this._core.installFile(file).then((targetPath:string) => {
					res.written.set(targetPath, file);
					d.resolve(res);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 download selection and parse and display header info
		 */
		info(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();

			this._core.select(selector).then((res:tsd.APIResult) => {
				//nest for scope
				return this._core.parseDefInfoBulk(res.selection).then(() => {
					d.resolve(res);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 load commit history
		 */
		history(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();

			this._core.select(selector).then((res:tsd.APIResult) => {
				// filter Defs from all selected versions
				res.definitions = tsd.DefUtil.getDefs(res.selection);

				//TODO limit history to Selector date filter?
				return this._core.loadHistoryBulk(res.definitions).then(() => {
					d.resolve(res);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 download files matching selector and solve dependencies
		 */
		deps(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();

			this._core.select(selector).then((res:tsd.APIResult) => {
				return this._core.resolveDepencendiesBulk(res.selection).then(() => {
					d.resolve(res);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 re-install from config
		 */
		reinstall():Q.Promise<APIResult> {
			var res = new tsd.APIResult(this._core.index, null);
			var d:Q.Deferred<APIResult> = Q.defer();

			this._core.reinstallBulk(this.context.config.getInstalled()).then((map:xm.IKeyValueMap) => {
				res.written = map;
			}).then(() => {
				d.resolve(res);
			}, d.reject);

			return d.promise;
		}

		/*
		 compare repo data with local installed file and check for changes
		 */
		//TODO implement compare() command
		compare(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();
			d.reject(new Error('not implemented yet'));

			return d.promise;
		}

		/*
		 run compare and get latest files
		 */
		//TODO implement update() command
		update(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar(selector, tsd.Selector, 'selector');
			var d:Q.Deferred<APIResult> = Q.defer();
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
			d.reject(new Error('not implemented yet'));

			return d.promise;
		}

		get debug():boolean {
			return this._debug;
		}

		set debug(value:boolean) {
			this._debug = value;
			this._core.debug = this._debug;
		}

		get core():tsd.Core {
			return this._core;
		}
	}
}
