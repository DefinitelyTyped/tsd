///<reference path="_ref.ts" />
///<reference path="logic/Core.ts" />
///<reference path="context/Context.ts" />
///<reference path="select/Selector.ts" />

module tsd {

	var path = require('path');
	var util = require('util');
	var Q:QStatic = require('Q');
	var FS:Qfs = require('Q-io/fs');
	/*
	 API: the high-level API used by dependants
	*/
	export class API {

		private _core:Core;

		constructor(public context:tsd.Context) {
			if (!context) {
				throw new Error('no context');
			}

			this._core = new tsd.Core(this.context);
		}

		// List files matching selector:
		search(selector:Selector):Qpromise {
			return this._core.select(selector);
		}

		// Install all files matching selector:
		install(selector:Selector):Qpromise {
			return this._core.select(selector).then((res:tsd.APIResult) => {
				return this._core.writeFileBulk(res.selection).then((paths) => {
					res.written = paths;

				}).thenResolve(res);
			});
		}

		// Download selection and parse and display header info
		info(selector:Selector):Qpromise {
			return this._core.select(selector).then((res:tsd.APIResult) => {
				//nest for scope
				return this._core.parseDefInfoBulk(res.selection).thenResolve(res);
			});
		}

		// Load commit history
		history(selector:Selector):Qpromise {
			return this._core.select(selector).then((res:tsd.APIResult) => {
				// filter Defs from all selected versions
				res.definitions = tsd.DefUtil.uniqueDefs(tsd.DefUtil.getDefs(res.selection));
				//TODO limit history to Selector's date filter?
				return this._core.loadHistoryBulk(res.definitions).thenResolve(res);
			});
		}

		//TODO Download files matching selector, and recursively solve reference dependencies.
		deps(selector:Selector):Qpromise {
			// var res = new APIResult('deps', selector);
			return Q.reject(new Error('not implemented yet'));
		}

		//TODO Compare repo data with local installed file and check for changes. First only use hashes and checksum/ but later this can be detailed with a fancyfied diff.
		compare(selector:Selector):Qpromise {
			return Q.reject(new Error('not implemented yet'));
		}

		//TODO Run compare and get latest files.
		update(selector:Selector):Qpromise {
			return Q.reject(new Error('not implemented yet'));
		}

		//TODO Clear caches
		purge():Qpromise {
			// add proper safety checks (let's not accidentally rimraf root during development)
			return Q.reject(new Error('not implemented yet'));
		}
	}
}