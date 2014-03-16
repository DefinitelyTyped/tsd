// Type definitions for json-pointer
// Project: https://npmjs.org/package/json-pointer 0.1.0 l
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module JSON_Pointer {
	/**
	 *  Looks up a JSON pointer in an object.
	 */
	export function get(object:Object, pointer):any;
	/**
	 *  Set a value for a JSON pointer on object.
	 */
	export function set(object:Object, pointer:string, value:any):any;
	/**
	 *  Removes an attribute of object referenced by pointer
	 */
	export function remove(object:Object, pointer:string):any;
	/**
	 *  Creates a dictionary object (pointer -> value).
	 */
	export function dict(object:Object):any;
	/**
	 *  Just like: each(pointer.dict(obj), iterator);
	 */
	export function walk(object:Object, iterator:Function):any;
	/**
	 *  Tests if an object has a value for a JSON pointer.
	 */
	export function has(object:Object, pointer:string):any;
	/**
	 *  Escapes a reference token.
	 */
	export function escape(str:string):any;
	/**
	 *  Unescape a reference token.
	 */
	export function unescape(str:string):any;
	/**
	 *  Converts a JSON pointer into an array of reference tokens.
	 */
	export function parse(str:string):any;
	/**
	 *  Builds a json pointer from an array of reference tokens.
	 */
	export function compile(str:string):any;
}
declare function JSON_Pointer(object?:Object): JSON_PointerWrap;

interface JSON_PointerWrap {
	/**
	 *  Looks up a JSON pointer in an object.
	 */
	get(pointer):any;
	/**
	 *  xxxx
	 */
	set(pointer:string, value:any):any;
	/**
	 *  Removes an attribute of object referenced by pointer
	 */
	remove(pointer:string):any;
	/**
	 *  Creates a dictionary object (pointer -> value).
	 */
	dict():any;
	/**
	 *  Just like: each(pointer.dict(obj), iterator);
	 */
	walk(iterator:Function):any;
	/**
	 *  Tests if an object has a value for a JSON pointer.
	 */
	has(pointer:string):any;
}

declare module 'json-pointer' {
	export = JSON_Pointer;
}
