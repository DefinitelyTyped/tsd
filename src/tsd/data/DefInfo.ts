/// <reference path="../_ref.ts" />
/// <reference path="Def.ts" />
/// <reference path="../../xm/data/AuthorInfo.ts" />

module tsd {
	'use strict';

	var endSlashTrim = /\/?$/;

	/*
	 DefInfo: parsed info from single definition source
	 */
	export class DefInfo {
		name:string;
		description:string;
		projectUrl:string;

		authors:xm.AuthorInfo[];
		// reposName:string;
		reposUrl:string;

		references:string[] = [];

		constructor() {
			this.resetAll();
		}

		resetFields() {
			this.name = '';
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

		toString():string {
			return this.name;
		}

		// harsh
		isValid():boolean {
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
}
