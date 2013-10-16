/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="io/StyledOut.ts" />
/// <reference path="stack.ts" />

module xm {
	'use strict';

	var util = require('util');
	require('colors');

	export var consoleOut:xm.StyledOut = new xm.StyledOut();

	export interface Logger  {
		(...args:any[]):void;
		ok(...args:any[]):void;
		log(...args:any[]):void;
		warn(...args:any[]):void;
		error(...args:any[]):void;
		debug(...args:any[]):void;
		inspect(value:any, depth?:number, label?:string):void;
		json(value:any):void;
		enabled:boolean;
		out:xm.StyledOut;
	}

	function writeMulti(logger:Logger, args:any[]):void {
		var ret = [];
		for (var i = 0, ii = args.length; i < ii; i++) {
			var value = args[i];
			if (value && typeof value === 'object') {
				ret.push(util.inspect(value, <any>{showHidden: false, depth: 8}));
			}
			else {
				ret.push(value);
			}
		}
		logger.out.line(ret.join('; '));
	}

	//TODO should be createLogger as there is no storage
	export function getLogger(label?:string):xm.Logger {

		label = arguments.length > 0 ? (String(label) + ' ') : '';

		var precall = function () {
			//not working with promises
			/*if (logger.callSite) {
				xm.stack.getStackLines(0, 0, true).map((line:xm.stack.Stackline) => {
					logger.out.span('-# ').line(line.link);
				});
			}*/
		};

		var plain = function (...args:any[]) {
			if (logger.enabled) {
				precall();
				writeMulti(logger, args);
			}
		};

		var doLog = function (logger, args) {
			if (args.length > 0) {
				logger.out.span(' ');
				writeMulti(logger, args);
			}
		};

		var logger:Logger = <Logger>(function (...args:any[]) {
			if (logger.enabled) {
				plain.apply(null, args);
			}
		});
		logger.out = consoleOut;
		logger.enabled = true;

		// alias
		logger.log = plain;

		logger.ok = function (...args:any[]) {
			if (logger.enabled) {
				precall();
				logger.out.span('-> ').success(label + 'ok');
				doLog(logger, args);
			}
		};
		logger.warn = function (...args:any[]) {
			if (logger.enabled) {
				precall();
				logger.out.span('-> ').warning(label + 'warning');
				doLog(logger, args);
			}
		};
		logger.error = function (...args:any[]) {
			if (logger.enabled) {
				precall();
				logger.out.span('-> ').error(label + 'error');
				doLog(logger, args);
			}
		};
		logger.debug = function (...args:any[]) {
			if (logger.enabled) {
				precall();
				logger.out.span('-> ').accent(label + 'debug');
				doLog(logger, args);
			}
		};
		logger.inspect = function (value:any, depth:number = 3, label?:string) {
			if (logger.enabled) {
				precall();
				logger.out.span('-> ').cond(arguments.length > 2, label + ' ').inspect(value, depth);
			}
		};
		logger.json = function (value:any, label?:string) {
			if (logger.enabled) {
				precall();
				logger.out.span('-> ').cond(arguments.length > 2, label + ' ').block(JSON.stringify(value, null, 3));
			}
		};

		return logger;
	}

	export var log:xm.Logger = getLogger();
}
