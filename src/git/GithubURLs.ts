/// <reference path="./_ref.d.ts" />

'use strict';

import assertVar = require('../xm/assertVar');
import objectUtils = require('../xm/objectUtils');
import URLManager = require('../xm/lib/URLManager');
import GithubRepo = require('./GithubRepo');

/*
 GithubURLs: url-templates for common urls
 */
class GithubURLs extends URLManager {

	private _base: string = 'https://github.com/{owner}/{project}';
	private _apiBase: string = 'https://api.github.com';
	private _api: string = 'https://api.github.com/repos/{owner}/{project}';
	private _raw: string = 'https://raw.githubusercontent.com/{owner}/{project}';

	private _enterpriseBase: string = 'https://{githubHost}/{owner}/{project}';
	private _enterpriseApiBase: string = 'https://{githubHost}/api/v3';
	private _enterpriseApi: string = 'https://{githubHost}/api/v3/repos/{owner}/{project}';
	private _enterpriseRaw: string = 'https://{githubHost}/{owner}/{project}/raw';
	private _repo: GithubRepo;

	constructor(repo: GithubRepo) {
		super();
		assertVar(repo, 'object', 'repo');

		this._repo = repo;
		var base: string = this._base;
		var raw: string = this._raw;
		var api: string = this._api;
		var apiBase: string = this._apiBase;
		if (this._repo.config.githubHost !== 'github.com') {
			// We are working with an enterprise github
			base = this._enterpriseBase;
			raw = this._enterpriseRaw;
			api = this._enterpriseApi;
			apiBase = this._enterpriseApiBase;
		}
		// externalise later
		this.addTemplate('base', base);

		this.addTemplate('raw', raw);
		this.addTemplate('rawFile', raw + '/{+ref}/{+path}');

		this.addTemplate('htmlFile', base + '/blob/{ref}/{+path}');

		this.addTemplate('api', api);
		this.addTemplate('apiTree', api + '/git/trees/{tree}?recursive={recursive}');
		this.addTemplate('apiBranch', api + '/branches/{branch}');
		this.addTemplate('apiBranches', api + '/branches');
		this.addTemplate('apiCommit', api + '/commits/{commit}');
		this.addTemplate('apiPathCommits', api + '/commits?path={path}');
		this.addTemplate('apiBlob', api + '/git/blobs/{blob}');
		this.addTemplate('rateLimit', apiBase + '/rate_limit');
	}

	getURL(id: string, vars?: any): string {
		this.setVars({
			githubHost: this._repo.config.githubHost,
			owner: this._repo.config.repoOwner,
			project: this._repo.config.repoProject
		});
		return super.getURL(id, vars);
	}

	api(): string {
		return this.getURL('api');
	}

	base(): string {
		return this.getURL('base');
	}

	raw(): string {
		return this.getURL('raw');
	}

	rawFile(ref: string, path: string): string {
		assertVar(ref, 'string', 'ref');
		assertVar(path, 'string', 'path');

		return this.getURL('rawFile', {
			ref: ref,
			path: path
		});
	}

	htmlFile(ref: string, path: string): string {
		assertVar(ref, 'string', 'ref');
		assertVar(path, 'string', 'path');

		return this.getURL('htmlFile', {
			ref: ref,
			path: path
		});
	}

	apiBranches(): string {
		return this.getURL('apiBranches');
	}

	apiBranch(name: string): string {
		assertVar(name, 'string', 'name');
		return this.getURL('apiBranch', {
			branch: name
		});
	}

	apiTree(tree: string, recursive?: any): string {
		assertVar(tree, 'sha1', 'tree');
		return this.getURL('apiTree', {
			tree: tree,
			recursive: (recursive ? 1 : 0)
		});
	}

	apiPathCommits(path: string): string {
		assertVar(path, 'string', 'path');
		return this.getURL('apiPathCommits', {
			path: path
		});
	}

	apiCommit(commit: string, recursive?: any): string {
		assertVar(commit, 'sha1', 'commit');
		return this.getURL('apiCommit', {
			commit: commit,
			recursive: recursive
		});
	}

	apiBlob(sha: string): string {
		assertVar(sha, 'sha1', 'sha');
		return this.getURL('apiBlob', {
			blob: sha
		});
	}

	rateLimit(): string {
		return this.getURL('rateLimit');
	}
}

export = GithubURLs;
