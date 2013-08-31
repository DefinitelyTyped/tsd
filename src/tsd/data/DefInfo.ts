///<reference path="../_ref.ts" />
///<reference path="Def.ts" />

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

		references:string[] = [];

		constructor() {
			this.resetAll();
		}

		resetFields() {
			this.name = '';
			this.version = '';
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
		}

		toString():string {
			var ret = this.name;
			if (this.submodule) {
				ret += ' ' + this.submodule;
			}
			if (this.version) {
				ret += ' ' + this.version;
			}
			if (this.description) {
				ret += ' ' + JSON.stringify(<any>this.description);
			}
			return ret;
		}

		isValid():bool {
			// || !this.description
			if (!this.name) {
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