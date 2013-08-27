module git {
	export interface GithubJSONTreeElem {
		mode:string;
		type:string;
		sha:string;
		path:string;
		size:number;
		url:string;
	}
}