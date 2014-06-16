/// <reference path="../_ref.d.ts" />

'use strict';

import header = require('definition-header');

import AuthorInfo = require('../support/AuthorInfo');

/*
 DefInfo: parsed info from single definition source
 */
class DefInfo {
	name: string;
	version: string;
	projects: string[];

	authors: AuthorInfo[];

	references: string[] = [];

	constructor() {
		this.resetAll();
	}

	resetFields() {
		this.name = '';
		this.version = '';
		this.projects = [];

		this.authors = [];
	}

	resetAll() {
		this.resetFields();

		this.references = [];
	}

	toString(): string {
		return this.name;
	}

	// harsh
	isValid(): boolean {
		// || !this.description
		if (!this.name) {
			return false;
		}
		/*if (this.authors.length === 0) {
			return false;
		}
		//!this.reposName ||
		if (!this.reposUrl) {
			return false;
		}*/
		return true;
	}
}

export = DefInfo;
