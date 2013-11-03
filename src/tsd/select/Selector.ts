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

		//TODO implement something like DateMatcher / InfoMatcher?
		//dateMatcher:DateMatcher;
		infoMatcher:InfoMatcher;
		beforeDate:Date;
		afterDate:Date;
		commitSha:string;
		blobSha:string;
		timeout:number = 10000;
		minMatches:number = 0;
		maxMatches:number = 0;
		limitApi:number = 0;

		//move to options?
		overwriteFiles:boolean = false;
		resolveDependencies:boolean = false;
		saveToConfig:boolean = false;

		constructor(pattern:string = '*') {
			xm.assertVar(pattern, 'string', 'pattern');
			this.pattern = new tsd.NameMatcher(pattern);
		}

		/*get requiresSource():boolean {
			return !!(this.resolveDependencies || this.infoMatcher);
		}*/

		get requiresHistory():boolean {
			return !!(this.beforeDate || this.afterDate);
		}

		toString():string {
			return this.pattern.pattern;
		}
	}
}
