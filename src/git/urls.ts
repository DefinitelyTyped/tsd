///<reference path="../_ref.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/io/URLManager.ts" />

module git {

	var assert = require('assert');
	var _:UnderscoreStatic = require('underscore');

	export interface URLTemplateParser {
		parse(template:string):URLTemplate;
	}
	export interface URLTemplate {
		expand(vars:any):string;
	}

	var template:URLTemplateParser = require('url-template');

	export class GitAPIUrls extends xm.URLManager {

		private _api:string = 'https://api.github.com/repos';
		private _project:string;

		constructor(repoOwner:string, projectName:string) {
			super();
			assert.ok(repoOwner, 'expected repoOwner argument');
			assert.ok(projectName, 'expected projectName argument');

			this.setVars({
				owner: repoOwner,
				project: projectName
			});
			this._project = this._api + '/{owner}/{project}';

			// externalise later
			this.addTemplate('project', this._project);
			this.addTemplate('heads', this._project + '/git/refs/heads');
			this.addTemplate('branch_head', this._project + '/git/refs/heads/{branch}');
			this.addTemplate('commit', this._project + '/git/commits/{sha}');
			this.addTemplate('tree', this._project + '/git/trees/{sha}');
		}

		public branchHeadList():string {
			return this.getURL('heads');
		}

		public branchHead(branch:String):string {
			return this.getURL('branch_head', {
				branch: branch
			});
		}

		public commit(sha:string):string {
			return this.getURL('commit', {
				sha: sha
			});
		}

		public tree(sha:string):string {
			return this.getURL('tree', {
				sha: sha
			});
		}
	}
}