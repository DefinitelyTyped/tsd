/// <reference path="../_ref.d.ts" />

interface GithubJSONCommit {
	mode: string;
	type: string;
	sha: string;
	path: string;
	size: number;
	url: string;
}

export = GithubJSONCommit;
