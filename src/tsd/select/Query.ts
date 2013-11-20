///<reference path="../_ref.ts" />
///<reference path="NameMatcher.ts" />
///<reference path="InfoMatcher.ts" />
///<reference path="DateMatcher.ts" />
///<reference path="VersionMatcher.ts" />

module tsd {
	'use strict';

	/*
	 Query: bundles the various selector options
	 */
	export class Query {

		patterns:NameMatcher[] = [];

		versionMatcher:VersionMatcher;
		dateMatcher:DateMatcher;
		infoMatcher:InfoMatcher;

		parseInfo:boolean = false;
		loadHistory:boolean = false;

		//TODO implement this
		commitSha:string;

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
			return !!(this.infoMatcher || this.parseInfo);
		}

		get requiresHistory():boolean {
			return !!(this.dateMatcher || this.commitSha || this.loadHistory);
		}

		toString():string {
			return this.patterns.reduce((memo:string[], matcher:NameMatcher) => {
				memo.push(matcher.pattern);
				return memo;
			}, []).join(', ');
		}
	}
}
