/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */
module xm {
	'use strict';

	var natives = {
		'[object Arguments]': 'arguments',
		'[object Array]': 'array',
		'[object Date]': 'date',
		'[object Function]': 'function',
		'[object Number]': 'number',
		'[object RegExp]': 'regexp',
		'[object String]': 'string'
	};

	export function typeOf(obj:any):string {
		var str = Object.prototype.toString.call(obj);
		if (natives[str]) {
			return natives[str];
		}
		if (obj === null) {
			return 'null';
		}
		if (obj === undefined) {
			return 'undefined';
		}
		if (obj === Object(obj)) {
			return 'object';
		}
		return typeof obj;
	}

	var jsonTypes:string[] = [
		'array',
		'object',
		'boolean',
		'number',
		'string',
		'null'
	];

	var objectNameExp = /(^\[object )|(\]$)/gi;

	export function toProtoString(obj:any):string {
		return Object.prototype.toString.call(obj).replace(objectNameExp, '');
	}

	var typeMap:any = {
		arguments: isArguments,
		array: isArray,
		date: isDate,
		function: isFunction,
		number: isNumber,
		regexp: isRegExp,
		string: isString,
		null: isNull,
		undefined: isUndefined,
		object: isObject,
		boolean: isBoolean,
		ok: isOk,
		valid: isValid,
		jsonValue: isJSONValue
	};

	export function hasOwnProp(obj:any, prop:string):boolean {
		return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	export function isType(obj:any, type:string):boolean {
		if (hasOwnProp(typeMap, type)) {
			return typeMap[type].call(null, obj);
		}
		return false;
	}

	export function isArguments(obj:any):boolean {
		return (typeOf(obj) === 'arguments');
	}

	export function isArray(obj:any):boolean {
		return (typeOf(obj) === 'array');
	}

	export function isDate(obj:any):boolean {
		return (typeOf(obj) === 'date');
	}

	export function isFunction(obj:any):boolean {
		return (typeOf(obj) === 'function');
	}

	export function isNumber(obj:any):boolean {
		return (typeOf(obj) === 'number');
	}

	export function isRegExp(obj:any):boolean {
		return (typeOf(obj) === 'regexp');
	}

	export function isString(obj:any):boolean {
		return (typeOf(obj) === 'string');
	}

	export function isNull(obj:any):boolean {
		return (typeOf(obj) === 'null');
	}

	export function isUndefined(obj:any):boolean {
		return (typeOf(obj) === 'undefined');
	}

	export function isObject(obj:any):boolean {
		return (typeOf(obj) === 'object');
	}

	export function isBoolean(obj:any):boolean {
		return (typeOf(obj) === 'boolean');
	}
	// error?

	// - - - - meta types

	//TODO add more?
	export function isArrayLike(obj:any):boolean {
		return (typeOf(obj) === 'array' || typeOf(obj) === 'arguments');
	}

	export function isOk(obj:any):boolean {
		return !!obj;
	}

	export function isValid(obj:any):boolean {
		var type = typeOf(obj);
		return !(type === 'undefined' || type === 'null' || (type === 'number' && isNaN(obj)));
	}

	export function isJSONValue(obj:any):boolean {
		var type = typeOf(obj);
		return jsonTypes.indexOf(type) > -1;
	}

	//clone/extend the map
	export function getTypeOfMap(add?:any) {
		var name;
		var obj = {};
		for (name in typeMap) {
			if (hasOwnProp(typeMap, name)) {
				obj[name] = typeMap[name];
			}
		}
		if (add) {
			for (name in add) {
				if (hasOwnProp(add, name) && isFunction(add[name])) {
					obj[name] = add[name];
				}
			}
		}
		return obj;
	}

	//get a wrapper to check in the cloned/extended map
	export function getTypeOfWrap(add?:any):(obj:any, type:string) => boolean {
		var typeMap = getTypeOfMap(add);

		return function isTypeWrap(obj:any, type:string):boolean {
			if (hasOwnProp(typeMap, type)) {
				return typeMap[type].call(null, obj);
			}
			return false;
		};
	}
}
