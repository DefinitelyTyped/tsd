///<reference path="_ref.ts" />
///<reference path="APICore.ts" />
///<reference path="context/Context.ts" />
///<reference path="data/Selector.ts" />

module tsd {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var async:Async = require('async');

	export class API {

		private _core:APICore;

		constructor(public context:tsd.Context) {
			if (!context) {
				throw new Error('no context');
			}

			this._core = new APICore(this.context);
		}

		// List files matching selector:
		search(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void) {
			// var res = new APIResult('search', selector);

		}

		// Download files matching selector, and recursively solve reference dependencies.
		deps(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void) {
			// var res = new APIResult('deps', selector);

		}

		// Install all files matching selector:
		install(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void) {

		}

		// Download selection and parse header info
		details(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void) {

		}

		// Compare repo data with local installed file and check for changes. First only use hashes and checksum/ but later this can be detailed with a fancyfied diff.
		compare(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void) {

		}

		// Run compare and get latest files.
		update(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void) {

		}

		// Init project by either creating default files or read existing config
		init(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void) {

		}
	}
}