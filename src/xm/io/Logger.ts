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

	export interface Logger  {
		(...args:any[]):void;
		log(...args:any[]):void;
		ok(...args:any[]):void;
		warn(...args:any[]):void;
		error(...args:any[]):void;
		debug(...args:any[]):void;
		inspect(value:any, label?:string, depth?:number):void;
		mute:boolean;
	}

	export function getLogger(label?:string, writer?:xm.LineWriter):xm.Logger {
		writer = writer || new xm.ConsoleLineWriter();

		label = arguments.length > 0 ? (String(label) + ': ').cyan : '';

		var writeMulti = (prefix:string, postfix:string, args:any[]) => {
			if (logger.mute) {
				return;
			}
			var ret = [];
			for (var i = 0, ii = args.length; i < ii; i++) {
				var value = args[i];
				if (value && typeof value === 'object') {
					ret.push(util.inspect(value, {showHidden: false, depth: 8}));
				}
				else {
					ret.push(value);
				}
			}
			writer.writeln(label + prefix + ret.join('; ') + postfix);
		};

		var plain = (...args:any[]) => {
			writeMulti('', '', args);
		};

		var logger:Logger = <Logger>((...args:any[]) => {
			plain.apply(null, args);
		});
		// alias
		logger.log = plain;
		logger.mute = false;
		logger.ok = (...args:any[]) => {
			writeMulti('ok: '.green, '', args);
		};
		logger.warn = (...args:any[]) => {
			writeMulti('warn: '.yellow, '', args);
		};
		logger.error = (...args:any[]) => {
			writeMulti('error: '.red, '', args);
		};
		logger.debug = (...args:any[]) => {
			writeMulti('debug: '.cyan, '', args);
		};
		logger.inspect = (value:any, label?:string, depth:number = 4) => {
			label = label ? label + ':\n' : '';
			writer.writeln(label + util.inspect(value, {showHidden: false, depth: depth }));
		};

		return logger;
	}

	export var log:xm.Logger = getLogger();
}
