module git {

	/*
	 interfaces for githuv json responses
	 */
	//TODO moar! (is there a simple tool for this?)
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