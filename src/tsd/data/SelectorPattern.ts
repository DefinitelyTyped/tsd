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

	function escapeExp(str) {
		return str.replace('.', '\\.');
	}

	//TODO use minimatch?
	export class SelectorFilePattern {

		pattern:string;
		projectExp:RegExp;
		nameExp:RegExp;

		constructor(pattern:string) {
			xm.assertVar('pattern', pattern, 'string');
			this.pattern = pattern;
			this.compile();
		}

		matchTo(list:DefFile[]):DefFile[] {
			var self:tsd.SelectorFilePattern = this;

			var filter = (file:DefFile) => {
				return (self.projectExp && self.projectExp.test(file.project))
					&& (self.nameExp && self.nameExp.test(file.name));
			};

			return list.filter(filter, this);
		}

		// crude
		compile():void {
			if (!this.pattern) {
				throw (new Error('SelectorFilePattern undefined pattern'));
			}
			xm.log('' + patternSplit);

			patternSplit.lastIndex = 0;
			var match = patternSplit.exec(this.pattern);
			if (!match) {
				throw (new Error('SelectorFilePattern cannot parse pattern: "' + this.pattern + '"'));
			}

			//xm.log(match);

			if (match.length < 7) {
				throw (new Error('SelectorFilePattern bad match: "' + match + '"'));
			}
			var glue:xm.RegExpGlue;


			var gotProject = false;
			glue = xm.RegExpGlue.get('^');
			if (match[1].length > 0) {
				glue.append(wordLazy);
				gotProject = true;
			}
			if (match[2].length > 0) {
				glue.append(escapeExp(match[2]));
				gotProject = true;
			}
			if (match[3].length > 0) {
				glue.append(wordLazy);
				gotProject = true;
			}
			if (gotProject) {
				glue.append('$');
				this.projectExp = glue.join('i');
			}


			var gotFile = false;
			glue = xm.RegExpGlue.get('^');
			if (match[4].length > 0) {
				glue.append(wordLazy);
				gotFile = true;
			}
			if (match[5].length > 0) {
				glue.append(escapeExp(match[5]));
				gotFile = true;
			}
			if (match[6].length > 0) {
				glue.append(wordLazy);
				gotFile = true;
			}
			if (gotFile) {
				glue.append('$');
				this.nameExp = glue.join('i');
			}

			xm.log(this.projectExp);
			xm.log(this.nameExp);
		}
	}
}