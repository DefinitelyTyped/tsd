///<reference path="../_ref.ts" />
///<reference path="../../xm/RegExpGlue.ts" />
///<reference path="../data/Def.ts" />

module tsd {
	'use strict';

	// beh
	var wordParts = /[\w_\.-]/;
	var wordGreedy = /[\w_\.-]+/;
	var wordLazy = /[\w_\.-]*?/;
	var wordGlob:RegExp = /(\**)([\w_\.-]*?)(\**)/;

	// simple pattern: *project*/*name*
	var patternSplit:RegExp = xm.RegExpGlue.get('^', wordGlob, '/', wordGlob, '$').join();
	var patternSingle:RegExp = xm.RegExpGlue.get('^', wordGlob, '$').join();

	function escapeExp(str) {
		//this needs hardening (or ditch)
		return str.replace('.', '\\.');
	}
	/*
	 NameMatcher: match name selector (globs etc)
	 */
	//TODO use minimatch or replace RegExpGlue with XRegExp
	//TODO use semver-postfix?
	export class NameMatcher {

		pattern:string;
		private projectExp:RegExp;
		private nameExp:RegExp;

		constructor(pattern:string) {
			xm.assertVar('pattern', pattern, 'string');
			this.pattern = pattern;
		}

		filter(list:tsd.Def[]):tsd.Def[] {
			return list.filter(this.getFilterFunc(), this);
		}

		toString():string {
			return this.pattern;
		}

		// crude compilator
		private compile():void {
			if (!this.pattern) {
				throw (new Error('NameMatcher undefined pattern'));
			}
			this.projectExp = null;
			this.nameExp = null;

			if (this.pattern.indexOf('/') > -1) {
				//get a project/file filter
				this.compileSplit();
			}
			else {
				//just look at the names
				this.compileSingle();
			}
		}

		private compileSingle():void {
			patternSingle.lastIndex = 0;
			var match = patternSingle.exec(this.pattern);

			if (match.length < 4) {
				throw (new Error('NameMatcher bad match: "' + match + '"'));
			}
			var glue:xm.RegExpGlue;

			var gotMatch = false;
			glue = xm.RegExpGlue.get('^');
			if (match[1].length > 0) {
				glue.append(wordLazy);
				gotMatch = true;
			}
			if (match[2].length > 0) {
				glue.append(escapeExp(match[2]));
				gotMatch = true;
			}
			if (match[3].length > 0) {
				glue.append(wordLazy);
				gotMatch = true;
			}
			if (gotMatch) {
				glue.append('$');
				this.nameExp = glue.join('i');
			}
		}

		private compileSplit():void {
			patternSplit.lastIndex = 0;
			var match = patternSplit.exec(this.pattern);

			if (match.length < 7) {
				throw (new Error('NameMatcher bad match: "' + match + '"'));
			}
			var glue:xm.RegExpGlue;


			var gotProject = false;
			glue = xm.RegExpGlue.get('^');
			if (match[1].length > 0) {
				glue.append(wordLazy);
			}
			if (match[2].length > 0) {
				glue.append(escapeExp(match[2]));
				gotProject = true;
			}
			if (match[3].length > 0) {
				glue.append(wordLazy);
			}
			if (gotProject) {
				glue.append('$');
				this.projectExp = glue.join('i');
			}

			var gotFile = false;
			glue = xm.RegExpGlue.get('^');
			if (match[4].length > 0) {
				glue.append(wordLazy);
			}
			if (match[5].length > 0) {
				glue.append(escapeExp(match[5]));
				gotFile = true;
			}
			if (match[6].length > 0) {
				glue.append(wordLazy);
			}
			if (gotFile) {
				glue.append('$');
				this.nameExp = glue.join('i');
			}
			//xm.log(this.projectExp);
			//xm.log(this.nameExp);
		}

		//TODO (auto) cache compile result
		private getFilterFunc():(file:tsd.Def) => bool {
			this.compile();

			// get an efficient filter function
			if (this.nameExp) {
				if (this.projectExp) {
					return (file:tsd.Def) => {
						return this.projectExp.test(file.project) && this.nameExp.test(file.name);
					};
				}
				else {
					return (file:tsd.Def) => {
						return this.nameExp.test(file.name);
					};
				}
			}
			else if (this.projectExp) {
				return (file:tsd.Def) => {
					return this.projectExp.test(file.name);
				};
			}
			else {
				throw (new Error('NameMatcher cannot compile pattern: ' + JSON.stringify(<any>this.pattern) + ''));
			}
		}
	}
}
