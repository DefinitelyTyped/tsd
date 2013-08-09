///<reference path="_ref.ts" />
///<reference path="Core.ts" />
///<reference path="context/Context.ts" />

module xm {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var async:Async = require('async');

	export class APIOptions {
		constructor(){

		}
	}

	export class APIResult {
		constructor(){

		}
	}

	export class API {

		constructor(public context:tsd.Context){
			if (!this.context) throw new Error('no context');
		}

		/**
		 List files matching selector:
		 */
		public search(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void){

		}

		/**
		 Download files matching selector, and recursively solve reference dependencies.
		 */
		public deps(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void){

		}

		/**
		 Install all files matching selector:
		 */
		public install(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void){

		}

		/**
		 Download selection and parse header info
		 */
		public details(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void){

		}

		/**
		 Compare repo data with local installed file and check for changes. First only use hashes and checksum/ but later this can be detailed with a fancyfied diff.
		 */
		public compare(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void){

		}

		/**
		 Run compare and get latest files.
		 */
		public update(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void){

		}

		/**
		 Init project by either creating default files or read existing config
		 */

		public init(selector:Selector, options:APIOptions, callback:(err, res:APIResult) => void){

		}
	}
}