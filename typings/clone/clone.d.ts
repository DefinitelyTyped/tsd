// https://github.com/pvorb/node-clone

declare module 'clone' {
	function clone<U>(val: U, circular?: boolean): U;
	module clone {
		export function clonePrototype<U>(obj :U): U;
	}
	export = clone;
}
