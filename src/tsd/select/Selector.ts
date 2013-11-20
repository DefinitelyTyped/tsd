///<reference path="../_ref.ts" />
///<reference path="../../xm/RegExpGlue.ts" />
///<reference path="NameMatcher.ts" />
///<reference path="InfoMatcher.ts" />
///<reference path="DateMatcher.ts" />
///<reference path="VersionMatcher.ts" />

module tsd {
	'use strict';
	/*
	 Selector: bundles the various selector options
	 */
	export class Selector {

		patterns:NameMatcher[] = [];

		versionMatcher:VersionMatcher;
		dateMatcher:DateMatcher;
		infoMatcher:InfoMatcher;

		//TODO implement this
		commitSha:string;

		//TODO implement these (limitless powerr!)
		timeout:number = 10000;
		minMatches:number = 0;
		maxMatches:number = 0;
		limitApi:number = 0;

		//move to options?
		overwriteFiles:boolean = false;
		resolveDependencies:boolean = false;
		saveToConfig:boolean = false;

		constructor(pattern?:string) {
			xm.assertVar(pattern, 'string', 'pattern', true);
			if (pattern) {
				this.patterns.push(new tsd.NameMatcher(pattern));
			}
		}

		addNamePattern(pattern:string):void {
			xm.assertVar(pattern, 'string', 'pattern');
			this.patterns.push(new tsd.NameMatcher(pattern));
		}

		get requiresSource():boolean {
			return !!(this.resolveDependencies || this.infoMatcher);
		}

		get requiresHistory():boolean {
			return !!(this.dateMatcher || this.commitSha);
		}

		toString():string {
			return this.patterns.reduce((memo:string[], matcher:NameMatcher) => {
				memo.push(matcher.pattern);
				return memo;
			}, []).join(', ');
		}
	}
}
