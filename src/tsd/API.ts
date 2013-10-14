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
	//TODO consider splitting into more specific result for each command?
	//TODO consider ditching index (why is it in here?)
	//TODO add useful methods to result (wrap some helpers from DefUtils)
	export class APIResult {

		error:string;
		nameMatches:tsd.Def[];
		selection:tsd.DefVersion[];
		definitions:tsd.Def[];
		written:xm.IKeyValueMap<tsd.DefVersion> = new xm.KeyValueMap();
		//removed:xm.KeyValueMap = new xm.KeyValueMap();

		constructor(public index:DefIndex, public selector:tsd.Selector = null) {
			xm.assertVar('index', index, DefIndex);
			xm.assertVar('selector', selector, tsd.Selector, true);
		}
	}

	/*
	 API: the high-level API used by dependants: methods promise ApiResults
	 */
	export class API {

		private _core:Core;

		constructor(public context:tsd.Context) {
			xm.assertVar('context', context, tsd.Context);

			this._core = new tsd.Core(this.context);

			xm.ObjectUtil.hidePrefixed(this);
		}

		/*
		 read the config from Context.path.configFile
		 promise: undefined
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
		 promise: undefined
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
		 promise: APIResult
		 */
		search(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar('selector', selector, tsd.Selector);
			var d:Q.Deferred<APIResult> = Q.defer();

			this._core.select(selector).then(d.resolve, d.reject);

			return d.promise;
		}

		/*
		 install all files matching selector
		 promise: APIResult
		 */
		install(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar('selector', selector, tsd.Selector);
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
		 promise: APIResult
		 */
		directInstall(path:string, commitSha:string):Q.Promise<APIResult> {
			xm.assertVar('path', path, 'string');
			xm.assertVar('commitSha', commitSha, 'sha1');
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
		 promise: APIResult
		 */
		//TODO move into selector? meh?
		installFragment(path:string, commitShaFragment:string):Q.Promise<APIResult> {
			xm.assertVar('path', path, 'string');
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
		 promise: APIResult
		 */
		info(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar('selector', selector, tsd.Selector);
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
		 promise: APIResult
		 */
		history(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar('selector', selector, tsd.Selector);
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
		 promise: APIResult
		 */
		deps(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar('selector', selector, tsd.Selector);
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
		 promise: APIResult
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
		 compare repo data with local installed file and check for changes.
		 promise: APIResult
		 */
		//TODO implement compare() command
		compare(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar('selector', selector, tsd.Selector);
			var d:Q.Deferred<APIResult> = Q.defer();
			d.reject(new Error('not implemented yet'));

			return d.promise;
		}

		/*
		 run compare and get latest files.
		 promise: APIResult
		 */
		//TODO implement update() command
		update(selector:tsd.Selector):Q.Promise<APIResult> {
			xm.assertVar('selector', selector, tsd.Selector);
			var d:Q.Deferred<APIResult> = Q.defer();
			d.reject(new Error('not implemented yet'));

			return d.promise;
		}

		/*
		 clear caches and temporary files
		 promise: APIResult
		 */
		//TODO implement: purge() command
		purge():Q.Promise<APIResult> {
			// add proper safety checks (let's not accidentally rimraf too much)
			var d:Q.Deferred<APIResult> = Q.defer();
			d.reject(new Error('not implemented yet'));

			return d.promise;
		}

		get core():tsd.Core {
			return this._core;
		}
	}
}
