/// <reference path="../_ref.d.ts" />

/*
 interfaces for githuv json responses
 */
// TODO add more interfaces (is there a simple tool for this?)
interface GithubJSONTreeElem {
	mode: string;
	type: string;
	sha: string;
	path: string;
	size: number;
	url: string;
}

export = GithubJSONTreeElem;
