///<reference path="_ref.ts" />

module xm {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var async:Async = require('async');
	var _:UnderscoreStatic = require('underscore');

	export class APIOptions {
		constructor(){

		}
	}

	export class APIResult {
		constructor(){

		}
	}

	export class API {

		constructor(public info:ToolInfo, public repos:Repos){
			if (!this.info) throw new Error('no info');
			if (!this.repos) throw new Error('no repos');
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