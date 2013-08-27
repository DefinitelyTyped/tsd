///<reference path="../_ref.ts" />

module tsd {

	var endSlashTrim = /\/?$/;

	//TODO move to xm

	//single definition file in repo (parsed)
	export class DefInfo {
		name:string;
		version:string;
		submodule:string;
		description:string;
		projectUrl:string;

		authors:xm.AuthorInfo[];
		//reposName:string;
		reposUrl:string;

		sourcePath:string = '';

		references:string[] = [];
		dependencies:tsd.Definition[] = [];

		constructor() {
			this.resetAll();
		}

		resetFields() {
			this.name = '';
			this.version = '*';
			this.submodule = '';
			this.description = '';
			this.projectUrl = '';

			this.authors = [];
			//this.reposName = '';
			this.reposUrl = '';
		}

		resetAll() {
			this.resetFields();

			this.references = [];
			this.dependencies = [];
			this.sourcePath = '';
		}

		isValid():bool {
			// || !this.description
			if (!this.name || !this.version || !this.projectUrl) {
				return false;
			}
			if (this.authors.length === 0) {
				return false;
			}
			//!this.reposName ||
			if (!this.reposUrl) {
				return false;
			}
			return true;
		}
	}
}