// Type definitions for json-pointer
// Project: https://npmjs.org/package/json-pointer 0.1.0 l
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface JSON_Pointer {
	(object:Object):JSON_PointerWrap

	/**
	 *  Looks up a JSON pointer in an object.
	 */
	get(object:Object, pointer:string):any;
	/**
	 *  Set a value for a JSON pointer on object.
	 */
	set(object:Object, pointer:string, value:any):any;
	/**
	 *  Removes an attribute of object referenced by pointer
	 */
	remove(object:Object, pointer:string):any;
	/**
	 *  Creates a dictionary object (pointer -> value).
	 */
	dict(object:Object):any;
	/**
	 *  Just like: each(pointer.dict(obj), iterator);
	 */
	walk(object:Object, iterator:Function):any;
	/**
	 *  Tests if an object has a value for a JSON pointer.
	 */
	has(object:Object, pointer:string):boolean;
	/**
	 *  Escapes a reference token.
	 */
	escape(str:string):any;
	/**
	 *  Unescape a reference token.
	 */
	unescape(str:string):any;
	/**
	 *  Converts a JSON pointer into an array of reference tokens.
	 */
	parse(str:string):any;
	/**
	 *  Builds a json pointer from an array of reference tokens.
	 */
	compile(str:string):any;
}

interface JSON_PointerWrap {
	/**
	 *  Looks up a JSON pointer in an object.
	 */
	get(pointer:string):any;
	/**
	 *  Set a value for a JSON pointer on object.
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
	has(pointer:string):boolean;
}

declare module "json-pointer" {
	export = JSON_Pointer;
}
