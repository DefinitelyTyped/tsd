/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

//
interface Error {
	code:number;
}

module xm {
	'use strict';

	declare var Components:any;
	declare var chrome:any;

	var path = require('path');

	export module stack {
		var stackExp = /^ *at (.*?) \((.*?)(?::(\d+))?(?::(\d+))?\)$/gm;
		// var absoluteLead = /^((?:\w:[\\\/])|\/)/gm;

		export class Stackline {
			call:string;
			file:string;
			line:number = NaN;
			column:number = NaN;
			absolute:boolean;
			internal:boolean;
			link:string;

			getLink():string {
				if (!this.file) {
					return '';
				}
				if (isNaN(this.line)) {
					return this.file;
				}
				var ret = '[' + this.line;
				if (!isNaN(this.column)) {
					ret += ',' + this.column;
				}
				return this.file + ret + ']';
			}
		}

		export function getRawStack(err?:Error):string {
			// snippet from: http://pastebin.com/aRpPr5Sd
			err = err || new Error();
			if (err.stack) {
				// remove one stack level:
				if (typeof(chrome) !== 'undefined' || typeof(process) !== 'undefined') {
					// Google Chrome/Node.js:
					return err.stack.replace(/\n[^\n]*/, '');
				}
				else if (typeof(Components) !== 'undefined') {
					// Mozilla:
					return err.stack.substring(err.stack.indexOf('\n') + 1);
				}
				else {
					return err.stack;
				}
			}
			return '';
		}

		function isAbsolute(str:string):boolean {
			// TODO is this isAbsolute rule cross platform correct?
			str = path.normalize(str);
			var resolve = path.resolve(str);
			if (resolve === str) {
				return true;
			}
			return false;
		}

		export function trimInternalLines(lines:Stackline[]):Stackline[] {
			// trim from bottom upø
			var cut = lines.length - 1;
			while (cut > 0) {
				var line = lines[cut];
				if (!line.internal) {
					break;
				}
				cut--;
			}
			return lines.slice(0, cut + 1);
		}

		function lineFromMatch(match:RegExpExecArray):Stackline {
			var len = match.length;

			var line = new Stackline();
			line.call = match[1];

			line.file = len > 1 ? match[2] : '';
			// NaN allowed
			line.line = len > 2 ? parseInt(match[3], 10) : NaN;
			line.column = len > 3 ? parseInt(match[4], 10) : NaN;
			// line.src = match[0];
			line.link = line.getLink();

			line.absolute = isAbsolute(line.file);
			line.internal = !line.absolute;
			return line;
		}

		export function getStackLines(keep:number = 0, offset:number = 0, trim:boolean = false, err?:any):Stackline[] {
			var stack = getRawStack(err);

			// cut some lines from stack
			var trimTop = 2 + offset;
			var keepBottom = keep + offset;

			var line:Stackline;
			var lines:Stackline[] = [];
			var match:RegExpExecArray;

			stackExp.lastIndex = 0;

			while ((match = stackExp.exec(stack))) {
				stackExp.lastIndex = match.index + match[0].length;

				trimTop--;
				if (trimTop > 0) {
					continue;
				}
				line = lineFromMatch(match);

				lines.push(line);

				if (keep > 0) {
					keepBottom--;
					if (keepBottom <= 0) {
						break;
					}
				}
			}
			if (trim) {
				lines = trimInternalLines(lines);
			}
			return lines;
		}
	}
}
