module xm {

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
		warn(...args:any[]):void;
		error(...args:any[]):void;
		debug(...args:any[]):void;
		inspect(value:any, label?:string, depth?:number):void;
	}

	export function getLogger(writer?:xm.LineWriter):Logger {
		writer = writer || new xm.ConsoleLineWriter();

		var writeMulti = (prefix:string, postfix:string, args:any[]) => {
			for (var i = 0, ii = args.length; i < ii; i++) {
				writer.writeln(prefix + args[i] + postfix);
			}
		};

		var plain = (...args:any[]) => {
			writeMulti('', '', args);
		};

		var logger:any = (...args:any[]) => {
			plain.apply(null, args);
		};
		// alias
		logger.log = plain;

		logger.warn = (...args:any[]) => {
			writeMulti('warn: '.yellow, '', args);
		};
		logger.error = (...args:any[]) => {
			writeMulti('error: '.red, '', args);
		};
		logger.debug = (...args:any[]) => {
			writeMulti('debug: '.cyan, '', args);
		};
		logger.inspect = (value:any, label?:string, depth?:number = 6) => {
			label = label ? label + ':\n' : '';
			writer.writeln(label + util.inspect(value, {showHidden: false, depth: depth }));
		};

		return logger;
	}
}