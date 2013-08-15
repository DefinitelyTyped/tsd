///<reference path="_ref.ts" />
///<reference path="APICore.ts" />
///<reference path="context/Context.ts" />
///<reference path="Selector.ts" />

module tsd {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var async:Async = require('async');

	export class APIOptions {
		constructor() {

		}
	}

	export class APIResult {

		removed:tsd.Def[];
		added:tsd.Def[];
		error:any;

		constructor(public operation?:string, public selector?:tsd.Selector, public selection?:tsd.Def[]) {
			xm.assertVar('operation', operation, 'string');
			xm.assertVar('selector', selector, tsd.Selector);
		}
	}

	export class API {

		private _core:APICore;

		constructor(public context:tsd.Context) {
			if (!context) {
				throw new Error('no context');
			}

			this._core = new APICore(this.context);
		}

		// List files matching selector:
		search(selector:tsd.Selector, options:APIOptions, callback:(err, res:APIResult) => void) {
			var res = new APIResult('search', selector);
			this._core.select(selector, options, (err, selection:tsd.Def[]) => {
				res.error = err;
				res.selection = selection;
				callback(err, res);
			});
		}

		// Download files matching selector, and recursively solve reference dependencies.
		deps(selector:tsd.Selector, options:APIOptions, callback:(err, res:APIResult) => void) {
			var res = new APIResult('deps', selector);
			this._core.select(selector, options, (err, selection:tsd.Def[]) => {
				res.error = err;

				callback(err, res);
			});
		}

		// Install all files matching selector:
		install(selector:tsd.Selector, options:APIOptions, callback:(err, res:APIResult) => void) {

		}

		// Download selection and parse header info
		details(selector:tsd.Selector, options:APIOptions, callback:(err, res:APIResult) => void) {

		}

		// Compare repo data with local installed file and check for changes. First only use hashes and checksum/ but later this can be detailed with a fancyfied diff.
		compare(selector:tsd.Selector, options:APIOptions, callback:(err, res:APIResult) => void) {

		}

		// Run compare and get latest files.
		update(selector:tsd.Selector, options:APIOptions, callback:(err, res:APIResult) => void) {

		}

		// Init project by either creating default files or read existing config
		init(selector:tsd.Selector, options:APIOptions, callback:(err, res:APIResult) => void) {

		}
	}
}