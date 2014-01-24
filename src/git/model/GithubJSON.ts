module git {
	'use strict';

	/*
	 interfaces for githuv json responses
	 */
	// TODO add more interfaces (is there a simple tool for this?)
	export interface GithubJSONTreeElem {
		mode:string;
		type:string;
		sha:string;
		path:string;
		size:number;
		url:string;
	}

	export interface GithubJSONCommit {
		mode:string;
		type:string;
		sha:string;
		path:string;
		size:number;
		url:string;
	}
}
