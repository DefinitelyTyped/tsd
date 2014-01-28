/// <reference path="../_ref.d.ts" />
/// <reference path="_ref.d.ts" />
/// <reference path="GithubRepo.ts" />
/// <reference path="../xm/assertVar.ts" />
/// <reference path="../xm/object.ts" />
/// <reference path="../xm/URLManager.ts" />

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
		private _repo:GithubRepo;

		constructor(repo:GithubRepo) {
			super();
			xm.assertVar(repo, GithubRepo, 'repo');
			this._repo = repo;
			// externalise later
			this.addTemplate('base', this._base);

			this.addTemplate('raw', this._raw);
			this.addTemplate('rawFile', this._raw + '/{ref}/{+path}');

			this.addTemplate('htmlFile', this._base + '/blob/{ref}/{+path}');

			this.addTemplate('api', this._api);
			this.addTemplate('apiTree', this._api + '/git/trees/{tree}?recursive={recursive}');
			this.addTemplate('apiBranch', this._api + '/branches/{branch}');
			this.addTemplate('apiBranches', this._api + '/branches');
			this.addTemplate('apiCommit', this._api + '/commits/{commit}');
			this.addTemplate('apiPathCommits', this._api + '/commits?path={path}');
			this.addTemplate('apiBlob', this._api + '/git/blobs/{blob}');
			this.addTemplate('rateLimit', this._apiBase + '/rate_limit');

			xm.object.hidePrefixed(this);
		}

		getURL(id:string, vars?: any):string {
			this.setVars({
				owner: this._repo.config.repoOwner,
				project: this._repo.config.repoProject
			});
			return super.getURL(id, vars);
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

		rawFile(ref:string, path:string):string {
			xm.assertVar(ref, 'string', 'ref');
			xm.assertVar(path, 'string', 'path');

			return this.getURL('rawFile', {
				ref: ref,
				path: path
			});
		}

		htmlFile(ref:string, path:string):string {
			xm.assertVar(ref, 'string', 'ref');
			xm.assertVar(path, 'string', 'path');

			return this.getURL('htmlFile', {
				ref: ref,
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
