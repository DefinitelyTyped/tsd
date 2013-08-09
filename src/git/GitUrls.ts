///<reference path="../_ref.ts" />
///<reference path="_ref.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/io/URLManager.ts" />

module git {

	var assert = require('assert');
	var _:UnderscoreStatic = require('underscore');

	export class GitURLs extends xm.URLManager {

		private _api:string = 'https://api.github.com/repos/{owner}/{project}';
		private _base:string = 'https://github.com/{owner}/{project}';

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
			this.addTemplate('base', this._base);
			this.addTemplate('raw', this._base + '/raw');
			this.addTemplate('rawFile', this._base + '/raw/{+path}');
		}

		public api():string {
			return this.getURL('api');
		}

		public base():string {
			return this.getURL('base');
		}

		public raw(sha:string):string {
			return this.getURL('raw');
		}

		public rawFile(path:string):string {
			return this.getURL('rawFile', {
				path: path
			});
		}
	}
}