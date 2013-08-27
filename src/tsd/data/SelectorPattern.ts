///<reference path="../_ref.ts" />
///<reference path="../../xm/RegExpGlue.ts" />
///<reference path="Definition.ts" />

module tsd {

	// beh
	var wordParts = /[\w_\.-]/;
	var wordGreedy = /[\w_\.-]+/;
	var wordLazy = /[\w_\.-]*?/;
	var wordGlob:RegExp = /(\**)([\w_\.-]*?)(\**)/;

	// simple pattern: *project*/*name*
	var patternSplit:RegExp = xm.RegExpGlue.get('^', wordGlob, '/', wordGlob, '$').join();
	var patternSingle:RegExp = xm.RegExpGlue.get('^', wordGlob, '$').join();

	function escapeExp(str) {
		return str.replace('.', '\\.');
	}

	//TODO use minimatch?
	//TODO use semver-postfix?
	export class SelectorFilePattern {

		pattern:string;
		projectExp:RegExp;
		nameExp:RegExp;

		constructor(pattern:string) {
			xm.assertVar('pattern', pattern, 'string');
			this.pattern = pattern;
		}

		matchTo(list:tsd.Definition[]):tsd.Definition[] {
			return list.filter(this.getFilterFunc(), this);
		}

		// crude compilator
		//TODO rewrite for proper globbing?
		private compile():void {
			if (!this.pattern) {
				throw (new Error('SelectorFilePattern undefined pattern'));
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
				throw (new Error('SelectorFilePattern bad match: "' + match + '"'));
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
				throw (new Error('SelectorFilePattern bad match: "' + match + '"'));
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

		private getFilterFunc():(file:tsd.Definition) => bool {
			this.compile();

			// get an efficient filter function
			var self:tsd.SelectorFilePattern = this;
			if (this.nameExp) {
				if (this.projectExp) {
					return (file:tsd.Definition) => {
						return self.projectExp.test(file.project) && self.nameExp.test(file.name);
					};
				}
				else {
					return (file:tsd.Definition) => {
						return self.nameExp.test(file.name);
					};
				}
			}
			else if (this.projectExp) {
				return (file:tsd.Definition) => {
					return self.projectExp.test(file.name);
				};
			}
			else {
				throw (new Error('SelectorFilePattern cannot compile pattern: ' + JSON.stringify(this.pattern) + ''));
			}
		}
	}
}