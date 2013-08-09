///<reference path="../_ref.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/io/URLManager.ts" />

module git {

	var assert = require('assert');
	var _:UnderscoreStatic = require('underscore');

	export class GitUrls extends xm.URLManager {

		private _api:string = 'https://api.github.com/repos/{owner}/{project}';
		private _raw:string = 'https://github.com{owner}/{project}/raw';

		constructor(repoOwner:string, projectName:string) {
			super();
			assert.ok(repoOwner, 'expected repoOwner argument');
			assert.ok(projectName, 'expected projectName argument');

			this.setVars({
				owner: repoOwner,
				project: projectName
			});

			// externalise later
			this.addTemplate('api', this._api);
			this.addTemplate('api:heads', this._api + '/git/refs/heads');
			this.addTemplate('api:branch_head', this._api + '/git/refs/heads/{branch}');
			this.addTemplate('api:commit', this._api + '/git/commits/{sha}');
			this.addTemplate('api:tree', this._api + '/git/trees/{sha}');

			this.addTemplate('raw:file', this._raw + '/{path}');
		}

		public branchHeadList():string {
			return this.getURL('api:heads');
		}

		public branchHead(branch:String):string {
			return this.getURL('api:branch_head', {
				branch: branch
			});
		}

		public commit(sha:string):string {
			return this.getURL('api:commit', {
				sha: sha
			});
		}

		public tree(sha:string):string {
			return this.getURL('api:tree', {
				sha: sha
			});
		}

		public file(path:string):string {
			return this.getURL('raw:file', {
				path: path
			});
		}
	}
}