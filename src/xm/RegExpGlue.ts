/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="_ref.d.ts" />

module xm {
	'use strict';

	var expTrim = /^\/(.*)\/([a-z]+)*$/gm;
	var flagFilter = /[gim]/;
	//var flagFilter = /[gixsm]/;

	/*
	 RegExpGlue: glue RegExp's and strings together into longer RegExps
	 */
	//TODO refactor API to work better with optional escaping string chars
	export class RegExpGlue {

		parts:any[] = [];

		constructor(...exp:any[]) {
			if (exp.length > 0) {
				this.append.apply(this, exp);
			}
		}

		static get(...exp:any[]):RegExpGlue {
			var e = new RegExpGlue();
			return e.append.apply(e, exp);
		}

		static escapeChars(str:string):string {
			//http://stackoverflow.com/a/1144788/1026362
			return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
		}

		append(...exp:any[]):RegExpGlue {
			exp.forEach((value:RegExp) => {
				this.parts.push(value);
			}, this);
			return this;
		}

		getBody(exp:RegExp):string {
			expTrim.lastIndex = 0;
			var trim = expTrim.exec('' + exp);
			if (!trim) {
				return '';
			}
			return typeof trim[1] !== 'undefined' ? trim[1] : '';
		}

		getFlags(exp:RegExp):string {
			expTrim.lastIndex = 0;
			var trim = expTrim.exec('' + exp);
			if (!trim) {
				return '';
			}
			return typeof trim[2] !== 'undefined' ? this.getCleanFlags(trim[2]) : '';
		}

		getCleanFlags(flags:String):string {
			var ret = '';
			for (var i = 0; i < flags.length; i++) {
				var char = flags.charAt(i);
				if (flagFilter.test(char) && ret.indexOf(char) < 0) {
					ret += char;
				}
			}
			return ret;
		}

		join(flags?:string, seperator?:RegExp):RegExp {
			var glueBody = seperator ? this.getBody(seperator) : '';
			var chunks:string[] = [];

			flags = typeof flags !== 'undefined' ? this.getCleanFlags(flags) : '';

			this.parts.forEach((exp, index, arr) => {
				if (typeof exp === 'string') {
					chunks.push(exp);
					return;
				}
				expTrim.lastIndex = 0;
				var trim = expTrim.exec('' + exp);
				if (!trim) {
					return exp;
				}
				if (trim.length < 2) {
					console.log(trim);
					return;
				}
				chunks.push(trim[1]);
			}, this);

			return new RegExp(chunks.join(glueBody), flags);
		}
	}
}
