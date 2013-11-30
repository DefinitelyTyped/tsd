///<reference path="../_ref.d.ts" />
///<reference path="_ref.d.ts" />
///<reference path="GithubRepo.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="../xm/ObjectUtil.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/io/URLManager.ts" />

module git {
	'use strict';

	/*
	 GithubURLs: url-templates for common urls
	 */
	export class GithubURLs extends xm.URLManager {

		private _base:string = 'https://github.com/{owner}/{project}';
		private _apiBase:string = 'https://api.github.com';
		private _api:string = 'https://api.github.com/repos/{owner}/{project}';
		private _raw:string = 'https://raw.github.com/{owner}/{project}';

		constructor(repo:GithubRepo) {
			super();
			xm.assertVar(repo, GithubRepo, 'repo');

			this.setVars({
				owner: repo.ownerName,
				project: repo.projectName
			});

			// externalise later
			this.addTemplate('base', this._base);

			this.addTemplate('raw', this._raw);
			this.addTemplate('rawFile', this._raw + '/{commit}/{+path}');

			this.addTemplate('api', this._api);
			this.addTemplate('apiTree', this._api + '/git/trees/{tree}?recursive={recursive}');
			this.addTemplate('apiBranch', this._api + '/branches/{branch}');
			this.addTemplate('apiBranches', this._api + '/branches');
			this.addTemplate('apiCommit', this._api + '/commits/{commit}');
			this.addTemplate('apiPathCommits', this._api + '/commits?path={path}');
			this.addTemplate('apiBlob', this._api + '/git/blobs/{blob}');
			this.addTemplate('rateLimit', this._apiBase + '/rate_limit');

			xm.ObjectUtil.hidePrefixed(this);
		}

		api():string {
			return this.getURL('api');
		}

		base():string {
			return this.getURL('base');
		}

		raw():string {
			return this.getURL('raw');
		}

		rawFile(commit:string, path:string):string {
			xm.assertVar(commit, 'sha1', 'commit');
			xm.assertVar(path, 'string', 'path');
			return this.getURL('rawFile', {
				commit: commit,
				path: path
			});
		}

		apiBranches():string {
			return this.getURL('apiBranches');
		}

		apiBranch(name:string):string {
			xm.assertVar(name, 'string', 'name');
			return this.getURL('apiBranch', {
				branch: name
			});
		}

		apiTree(tree:string, recursive?:any):string {
			xm.assertVar(tree, 'sha1', 'tree');
			return this.getURL('apiTree', {
				tree: tree,
				recursive: (recursive ? 1 : 0)
			});
		}

		apiPathCommits(path:string):string {
			xm.assertVar(path, 'string', 'path');
			return this.getURL('apiPathCommits', {
				path: path
			});
		}

		apiCommit(commit:string, recursive?:any):string {
			xm.assertVar(commit, 'sha1', 'commit');
			return this.getURL('apiCommit', {
				commit: commit,
				recursive: recursive
			});
		}

		apiBlob(sha:string):string {
			xm.assertVar(sha, 'sha1', 'sha');
			return this.getURL('apiBlob', {
				blob: sha
			});
		}

		rateLimit():string {
			return this.getURL('rateLimit');
		}
	}
}
