///<reference path="_ref.ts" />
///<reference path="Core.ts" />
///<reference path="context/Context.ts" />
///<reference path="data/Selector.ts" />

module tsd {

	var path = require('path');
	var util = require('util');
	var Q:QStatic = require('Q');
	var FS:Qfs = require('Q-io/fs');

	export class API {

		private _core:tsd.Core;

		constructor(public context:tsd.Context) {
			if (!context) {
				throw new Error('no context');
			}

			this._core = new tsd.Core(this.context);
		}

		// List files matching selector:
		search(selector:tsd.Selector, options:tsd.APIOptions):Qpromise {
			return this._core.select(selector, options);
		}

		// Install all files matching selector:
		install(selector:tsd.Selector, options:tsd.APIOptions):Qpromise {
			return this._core.select(selector, options).then((res:tsd.APIResult) => {
				return this._core.writeFiles(res.selection);
			});
		}

		// Clear caches
		purge():Qpromise {
			// add proper safety checks (let's not accidentally rimraf root)
			return Q.reject(new Error('not yet implemented'));
		}

		// Download selection and parse header info
		details(selector:Selector, options:APIOptions):Qpromise {
			return this._core.select(selector, options).then((res:tsd.APIResult) => {
				//return this._core.writeFiles(res.selection);
			});
		}

		// Download files matching selector, and recursively solve reference dependencies.
		deps(selector:Selector, options:APIOptions):Qpromise {
			// var res = new APIResult('deps', selector);
			return Q.reject(new Error('not yet implemented'));
		}

		// Compare repo data with local installed file and check for changes. First only use hashes and checksum/ but later this can be detailed with a fancyfied diff.
		compare(selector:Selector, options:APIOptions):Qpromise {
			return Q.reject(new Error('not yet implemented'));
		}

		// Run compare and get latest files.
		update(selector:Selector, options:APIOptions):Qpromise {
			return Q.reject(new Error('not yet implemented'));
		}
	}
}