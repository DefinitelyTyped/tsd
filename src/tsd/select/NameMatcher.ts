/// <reference path="../_ref.d.ts" />

'use strict';

import VError = require('verror');
import assertVar = require('../../xm/assertVar');
import RegExpGlue = require('../../xm/lib/RegExpGlue');

import Def = require('../data/Def');

// beh
var wordParts = /[\w_\.-]/;
var wordGreedy = /[\w_\.-]+/;
var wordLazy = /[\w_\.-]*?/;
var wordGlob = /(\**)([\w_\.-]*?)(\**)/;

// simple pattern: *project*/*name*
var patternSplit: RegExp = RegExpGlue.get('^', wordGlob, '/', wordGlob, '$').join();
var patternSingle: RegExp = RegExpGlue.get('^', wordGlob, '$').join();

function escapeRegExpChars(str: string): string {
	// http://stackoverflow.com/a/1144788/1026362
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
/*
 NameMatcher: match name pattern (globs etc)
 */
// TODO use minimatch or replace RegExpGlue with XRegExp
// TODO add negation
class NameMatcher {

	pattern: string;
	private projectExp: RegExp;
	private nameExp: RegExp;

	constructor(pattern: string) {
		assertVar(pattern, 'string', 'pattern');
		this.pattern = pattern;
	}

	filter(list: Def[], current: Def[]): Def[] {
		return list.filter(this.getFilterFunc(current));
	}

	toString(): string {
		return this.pattern;
	}

	// crude compilator
	private compile(): void {
		if (!this.pattern) {
			throw (new VError('NameMatcher undefined pattern'));
		}
		this.projectExp = null;
		this.nameExp = null;

		if (this.pattern.indexOf('/') > -1) {
			// get a project/file filter
			this.compileSplit();
		}
		else {
			// just look at the names
			this.compileSingle();
		}

		// console.log(this.projectExp);
		// console.log(this.nameExp);
	}

	private compileSingle(): void {
		patternSingle.lastIndex = 0;
		var match = patternSingle.exec(this.pattern);

		if (match.length < 4) {
			throw new VError('NameMatcher bad match %s', match);
		}
		var glue: RegExpGlue;

		var gotMatch = false;
		glue = RegExpGlue.get('^');
		if (match[1].length > 0) {
			glue.append(wordLazy);
			gotMatch = true;
		}
		if (match[2].length > 0) {
			glue.append(escapeRegExpChars(match[2]));
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

	private compileSplit(): void {
		patternSplit.lastIndex = 0;
		var match = patternSplit.exec(this.pattern);

		if (match.length < 7) {
			throw new VError('NameMatcher bad match %s', match);
		}
		var glue: RegExpGlue;

		var gotProject = false;
		glue = RegExpGlue.get('^');
		if (match[1].length > 0) {
			glue.append(wordLazy);
		}
		if (match[2].length > 0) {
			glue.append(escapeRegExpChars(match[2]));
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
		glue = RegExpGlue.get('^');
		if (match[4].length > 0) {
			glue.append(wordLazy);
		}
		if (match[5].length > 0) {
			glue.append(escapeRegExpChars(match[5]));
			gotFile = true;
		}
		if (match[6].length > 0) {
			glue.append(wordLazy);
		}
		if (gotFile) {
			glue.append('$');
			this.nameExp = glue.join('i');
		}
	}

	private getFilterFunc(current: Def[]): (file: Def) => boolean {
		this.compile();

		// get an efficient filter function
		if (this.nameExp) {
			if (this.projectExp) {
				return (file: Def) => {
					return this.projectExp.test(file.project) && this.nameExp.test(file.name);
				};
			}
			else {
				return (file: Def) => {
					return this.nameExp.test(file.name);
				};
			}
		}
		else if (this.projectExp) {
			return (file: Def) => {
				return this.projectExp.test(file.project);
			};
		}
		else {
			throw new VError('NameMatcher cannot compile pattern %s', JSON.stringify(<any>this.pattern));
		}
	}
}

export = NameMatcher;
