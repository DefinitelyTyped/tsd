///<reference path="../_ref.ts" />
///<reference path="../../xm/RegExpGlue.ts" />
///<reference path="SelectorPattern.ts" />

module tsd {
	export class Selector {

		pattern:tsd.SelectorPattern;
		beforeDate:Date;
		afterDate:Date;
		resolveReferences:bool;

		constructor(pattern?:string = '*') {
			xm.assertVar('pattern', pattern, tsd.SelectorPattern);
			this.pattern = new tsd.SelectorPattern(pattern);
		}

		get requiresSource():bool {
			return !!(this.resolveReferences);
		}

		get requiresHistory():bool {
			return !!(this.beforeDate || this.afterDate);
		}
	}
}