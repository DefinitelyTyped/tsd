/// <reference path="../_ref.d.ts" />

'use strict';

import assertVar = require('../../xm/assertVar');

import NameMatcher = require('./NameMatcher');
import VersionMatcher = require('./VersionMatcher');
import DateMatcher = require('./DateMatcher');
import InfoMatcher = require('./InfoMatcher');
import CommitMatcher = require('./CommitMatcher');

/*
 Query: bundles the various selector options
 */
class Query {

	patterns: NameMatcher[] = [];

	versionMatcher: VersionMatcher;
	dateMatcher: DateMatcher;
	infoMatcher: InfoMatcher;
	commitMatcher: CommitMatcher;

	parseInfo: boolean = false;
	loadHistory: boolean = false;

	constructor(pattern?: string) {
		assertVar(pattern, 'string', 'pattern', true);
		if (pattern) {
			this.patterns.push(new NameMatcher(pattern));
		}
	}

	addNamePattern(pattern: string): void {
		assertVar(pattern, 'string', 'pattern');
		this.patterns.push(new NameMatcher(pattern));
	}

	get requiresHistory(): boolean {
		return !!(this.dateMatcher || this.commitMatcher || this.loadHistory);
	}

	toString(): string {
		return this.patterns.map((matcher: NameMatcher) => {
			return matcher.pattern;
		}).join(', ');
	}
}

export = Query;
