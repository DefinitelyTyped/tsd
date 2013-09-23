///<reference path="../_ref.ts" />
///<reference path="../../xm/RegExpGlue.ts" />
///<reference path="NameMatcher.ts" />
///<reference path="InfoMatcher.ts" />

module tsd {
	'use strict';
	/*
	 Selector: bundles the various selector options
	 */
	export class Selector {

		pattern:NameMatcher;

		resolveDependencies:bool = false;

		//TODO implement something like these
		//dateMatcher:DateMatcher;
		infoMatcher:InfoMatcher;
		limit:number = 10;
		beforeDate:Date;
		afterDate:Date;
		commitSha:string;

		constructor(pattern?:string = '*') {
			xm.assertVar('pattern', pattern, 'string');
			this.pattern = new tsd.NameMatcher(pattern);
		}

		/*get requiresSource():bool {
			return !!(this.resolveDependencies || this.infoMatcher);
		}*/

		get requiresHistory():bool {
			return !!(this.beforeDate || this.afterDate);
		}

		toString():string {
			return this.pattern.pattern;
		}
	}
}
