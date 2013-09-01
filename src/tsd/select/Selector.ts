///<reference path="../_ref.ts" />
///<reference path="../../xm/RegExpGlue.ts" />
///<reference path="NameMatcher.ts" />
///<reference path="InfoMatcher.ts" />

module tsd {
	export class Selector {

		pattern:NameMatcher;

		//TODO implement something like these
		resolveDependencies:bool;
		infoMatcher:InfoMatcher;
		limit:number = 10;
		beforeDate:Date;
		afterDate:Date;
		//dateMatcher:DateMatcher;

		constructor(pattern?:string = '*') {
			xm.assertVar('pattern', pattern, 'string');
			this.pattern = new tsd.NameMatcher(pattern);
		}

		get requiresSource():bool {
			return !!(this.resolveDependencies || this.infoMatcher);
		}

		get requiresHistory():bool {
			return !!(this.beforeDate || this.afterDate);
		}
	}
}