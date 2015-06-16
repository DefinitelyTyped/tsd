/// <reference path="../_ref.d.ts" />

'use strict';

import VError = require('verror');
import minimatch = require('minimatch');
import assertVar = require('../../xm/assertVar');

import Def = require('../data/Def');

/*
 NameMatcher: match name pattern (globs etc)
 */
class NameMatcher {

	pattern: string;

	constructor(pattern: string) {
		assertVar(pattern, 'string', 'pattern');
		this.pattern = pattern;
	}

	filter(list: Def[]): Def[] {
		return list.filter(this.getFilterFunc());
	}

	toString(): string {
		return this.pattern;
	}

	private getFilterFunc(): (file: Def) => boolean {
		if (!this.pattern) {
			throw (new VError('NameMatcher undefined pattern'));
		}

		var parts = this.pattern.split(/\//g);

		var projectPattern: (target: string) => boolean;
		var namePattern: (target: string) => boolean;

		var miniopts = {
			nocase: true
		};

		if (parts.length === 1) {
			// just look at the names
			if (parts[0].length > 0 && parts[0] !== '*') {
				namePattern = minimatch.filter(parts[0], miniopts);
			}
		}
		else {
			// get a project/file filter
			if (parts[0].length > 0 && parts[0] !== '*') {
				projectPattern = minimatch.filter(parts[0], miniopts);
			}
			if (parts[1].length > 0 && parts[1] !== '*') {
				namePattern = minimatch.filter(parts.slice(1).join(':'), miniopts);
			}
		}

		// get an efficient filter function
		if (namePattern) {
			if (projectPattern) {
				return (file: Def) => {
					return projectPattern(file.project) && namePattern(file.name);
				};
			}
			else {
				return (file: Def) => {
					return namePattern(file.name);
				};
			}
		}
		else if (projectPattern) {
			return (file: Def) => {
				return projectPattern(file.project);
			};
		}
		else {
			return (file: Def) => {
				return true;
			};
		}
	}
}

export = NameMatcher;
