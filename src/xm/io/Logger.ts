/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

module xm {
	'use strict';

	var util = require('util');
	require('colors');

	export interface LineWriter  {
		writeln(str:string):void;
	}

	export class ConsoleLineWriter implements LineWriter {
		writeln(str:string):void {
			console.log(str);
		}
	}

	export var consoleWriter = new ConsoleLineWriter();

	export interface Logger  {
		(...args:any[]):void;
		log(...args:any[]):void;
		ok(...args:any[]):void;
		warn(...args:any[]):void;
		error(...args:any[]):void;
		debug(...args:any[]):void;
		inspect(value:any, label?:string, depth?:number):void;
		mute:boolean;
		showLog:boolean;
	}
	function writeMulti(logger:Logger, label:string, args:any[]):void {
		if (logger.mute) {
			return;
		}
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
		consoleWriter.writeln(label + ret.join('; '));
	}

	export function getLogger(label?:string):xm.Logger {

		label = arguments.length > 0 ? (String(label) + ': ').cyan : '';

		var plain = (...args:any[]) => {
			writeMulti(logger, '', args);
		};

		var logger:Logger = <Logger>((...args:any[]) => {
			plain.apply(null, args);
		});
		var mute = false;
		// alias
		logger.log = plain;
		logger.showLog = true;
		//logger.showEvent = true;
		//logger.showCount = true;

		logger.ok = (...args:any[]) => {
			if (logger.showLog) {
				return;
			}
			writeMulti(logger, label + 'ok: '.green, args);
		};
		logger.warn = (...args:any[]) => {
			if (logger.showLog) {
				return;
			}
			writeMulti(logger, label + 'warn: '.yellow, args);
		};
		logger.error = (...args:any[]) => {
			if (logger.showLog) {
				return;
			}
			writeMulti(logger, label + 'error: '.red, args);
		};
		logger.debug = (...args:any[]) => {
			if (logger.showLog) {
				return;
			}
			writeMulti(logger, label + 'debug: '.cyan, args);
		};
		logger.inspect = (value:any, label?:string, depth:number = 4) => {
			if (logger.showLog) {
				return;
			}
			label = label ? label + ': ' : '';
			consoleWriter.writeln(label + util.inspect(value, <any>{showHidden: false, depth: depth }));
		};
		Object.defineProperty(logger, 'mute', {
			get: function () {
				return mute;
			},
			set: function (value) {
				mute = value;
				logger.showLog = !value;
			}
		});

		return logger;
	}

	export var log:xm.Logger = getLogger();
}
