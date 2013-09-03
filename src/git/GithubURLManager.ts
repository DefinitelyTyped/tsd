///<reference path="../_ref.ts" />
///<reference path="_ref.ts" />
///<reference path="GithubRepo.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="../xm/ObjectUtil />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/io/URLManager.ts" />

module git {

	var assert = require('assert');
	var _:UnderscoreStatic = require('underscore');

	/*
	 GithubURLManager: url-templates for common urls
	*/
	export class GithubURLManager extends xm.URLManager {

		private _base:string = 'https://github.com/{owner}/{project}';
		private _api:string = 'https://api.github.com/repos/{owner}/{project}';
		private _raw:string = 'https://raw.github.com/{owner}/{project}';

		constructor(repo:GithubRepo) {
			super();
			xm.assertVar('repo', repo, GithubRepo);

			this.setVars({
				owner: repo.ownerName,
				project: repo.projectName
			});

			// externalise later
			this.addTemplate('api', this._api);
			this.addTemplate('base', this._base);
			this.addTemplate('raw', this._raw);
			this.addTemplate('rawFile', this._raw + '/{commit}/{+path}');

			xm.ObjectUtil.hidePrefixed(this);
		}

		public api():string {
			return this.getURL('api');
		}

		public base():string {
			return this.getURL('base');
		}

		public raw():string {
			return this.getURL('raw');
		}

		public rawFile(commit:string, path:string):string {
			return this.getURL('rawFile', {
				commit: commit,
				path: path
			});
		}
	}
}