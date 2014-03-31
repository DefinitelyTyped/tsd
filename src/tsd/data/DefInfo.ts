/// <reference path="../_ref.d.ts" />

'use strict';

import AuthorInfo = require('../../xm/data/AuthorInfo');

/*
 DefInfo: parsed info from single definition source
 */
class DefInfo {
	name: string;
	version: string;
	description: string;
	projectUrl: string;

	authors: AuthorInfo[];
	// reposName:string;
	reposUrl: string;

	references: string[] = [];

	constructor() {
		this.resetAll();
	}

	resetFields() {
		this.name = '';
		this.version = '';
		this.description = '';
		this.projectUrl = '';

		this.authors = [];
		// this.reposName = '';
		this.reposUrl = '';
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
