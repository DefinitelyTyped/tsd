///<reference path="../_ref.ts" />
///<reference path="../../xm/RegExpGlue.ts" />
///<reference path="Definition.ts" />
///<reference path="SelectorPattern.ts" />

module tsd {
	export class Selector {

		pattern:tsd.SelectorFilePattern;
		beforeDate:Date;
		afterDate:Date;
		resolveReferences:bool;

		constructor(pattern?:string = '*') {
			xm.assertVar('pattern', pattern, tsd.SelectorFilePattern);
			this.pattern = new tsd.SelectorFilePattern(pattern);
		}

		get requiresSource():bool {
			return !!(this.resolveReferences);
		}

		get requiresHistory():bool {
			return !!(this.beforeDate || this.afterDate);
		}
	}
}