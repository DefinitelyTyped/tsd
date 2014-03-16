declare module 'mkdirp' {
	function Mkdirp(dir: string, flags?: any): void;
	module Mkdirp {
		// (dir: string):void;
		export function sync(dir: string, flags?: any): void;
	}
	export = Mkdirp;
}
