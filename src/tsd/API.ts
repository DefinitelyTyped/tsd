///<reference path="_ref.ts" />
///<reference path="logic/Core.ts" />
///<reference path="context/Context.ts" />
///<reference path="select/Selector.ts" />

module tsd {

	var path = require('path');
	var util = require('util');
	var Q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');

	/*
	 APIResult: hold result data (composition and meaning may vary)
	 */
	//TODO rename to DefSelection?
	//TODO consider splitting into more specific result for  each command?
	//TODO consider ditching index (why is it in here?)
	//TODO add useful methods to result (wrap some helpers from DefUtils)
	export class APIResult {

		error:string;
		nameMatches:tsd.Def[];
		selection:tsd.DefVersion[];
		definitions:tsd.Def[];
		written:xm.IKeyValueMap = new xm.KeyValueMap();
		//removed:xm.KeyValueMap = new xm.KeyValueMap();

		constructor(public index:DefIndex, public selector?:tsd.Selector = null) {
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
		 promise: null
		 */
		readConfig(optional:bool):Qpromise {
			return this._core.readConfig(optional).thenResolve(null);
		}

		/*
		 save the config to Context.path.configFile
		 promise: null
		 */
		saveConfig():Qpromise {
			return this._core.saveConfig().thenResolve(null);
		}

		/*
		 list files matching selector
		 promise: APIResult
		 */
		search(selector:tsd.Selector):Qpromise {
			xm.assertVar('selector', selector, tsd.Selector);

			return this._core.select(selector);
		}

		/*
		 install all files matching selector
		 promise: APIResult
		 */
		install(selector:tsd.Selector):Qpromise {
			xm.assertVar('selector', selector, tsd.Selector);

			//hardcode for now
			//TODO make proper cli option
			selector.resolveDependencies = true;

			//TODO keep and report more info about what was written/ignored, split by selected vs dependencies

			return this._core.select(selector).then((res:tsd.APIResult) => {

				var files:tsd.DefVersion[] = res.selection;

				//TODO dependency merge should be optionals
				files = tsd.DefUtil.mergeDependencies(files);

				return this._core.installFileBulk(files).then((written:xm.IKeyValueMap) => {
					if (!written) {
						throw new Error('expected install paths');
					}
					res.written = written;

					//TODO make saving optional
					return this._core.saveConfig();

				}).thenResolve(res);
			});
		}

		/*
		 direct install attempt
		 promise: APIResult
		 */
		directInstall(path:string, commitSha:string):Qpromise {
			xm.assertVar('path', path, 'string');
			xm.assertVar('commitSha', commitSha, 'sha1');

			var res = new tsd.APIResult(this._core.index, null);

			return this._core.procureFile(path, commitSha).then((file:tsd.DefVersion) => {
				return this._core.installFile(file).then((targetPath:string) => {
					res.written.set(targetPath, file);
					return null;
				});
			}).thenResolve(res);
		}

		/*
		 direct install from partial commitSha
		 promise: APIResult
		 */
		//TODO move into selector? meh?
		installFragment(path:string, commitShaFragment:string):Qpromise {
			xm.assertVar('path', path, 'string');

			var res = new tsd.APIResult(this._core.index, null);

			return this._core.findFile(path, commitShaFragment).then((file:tsd.DefVersion) => {
				return this._core.installFile(file).then((targetPath:string) => {
					res.written.set(targetPath, file);
					return res;
				});
			}).thenResolve(res);
		}

		/*
		 download selection and parse and display header info
		 promise: APIResult
		 */
		info(selector:tsd.Selector):Qpromise {
			xm.assertVar('selector', selector, tsd.Selector);

			return this._core.select(selector).then((res:tsd.APIResult) => {
				//nest for scope
				return this._core.parseDefInfoBulk(res.selection).thenResolve(res);
			});
		}

		/*
		 load commit history
		 promise: APIResult
		 */
		history(selector:tsd.Selector):Qpromise {
			xm.assertVar('selector', selector, tsd.Selector);

			return this._core.select(selector).then((res:tsd.APIResult) => {
				// filter Defs from all selected versions
				res.definitions = tsd.DefUtil.getDefs(res.selection);
				//TODO limit history to Selector's date filter?
				return this._core.loadHistoryBulk(res.definitions).thenResolve(res);
			});
		}

		/*
		 download files matching selector and solve dependencies
		 promise: APIResult
		 */
		deps(selector:tsd.Selector):Qpromise {
			xm.assertVar('selector', selector, tsd.Selector);

			return this._core.select(selector).then((res:tsd.APIResult) => {
				return this._core.resolveDepencendiesBulk(res.selection).thenResolve(res);
			});
		}

		/*
		 re-install from config
		 promise: APIResult
		 */
		reinstall():Qpromise {
			var res = new tsd.APIResult(this._core.index, null);

			return this._core.reinstallBulk(this.context.config.getInstalled()).then((map:xm.IKeyValueMap) => {
				res.written = map;
				return res;
			}).thenResolve(res);
		}

		/*
		 compare repo data with local installed file and check for changes.
		 promise: APIResult
		 */
		//TODO implement compare() command
		compare(selector:tsd.Selector):Qpromise {
			xm.assertVar('selector', selector, tsd.Selector);

			return Q.reject(new Error('not implemented yet'));
		}

		/*
		 run compare and get latest files.
		 promise: APIResult
		 */
		//TODO implement update() command
		update(selector:tsd.Selector):Qpromise {
			xm.assertVar('selector', selector, tsd.Selector);

			return Q.reject(new Error('not implemented yet'));
		}

		/*
		 clear caches and temporary files
		 promise: APIResult
		 */
		//TODO implement: purge() command
		purge():Qpromise {
			// add proper safety checks (let's not accidentally rimraf root during development)
			return Q.reject(new Error('not implemented yet'));
		}

		get core():tsd.Core {
			return this._core;
		}
	}
}