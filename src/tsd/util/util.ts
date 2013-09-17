///<reference path="../context/Const.ts" />

module tsd {
	export function shaShort(sha:string):string {
		return sha.substr(0, Const.shaShorten);
	}
}