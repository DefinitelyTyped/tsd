/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */
module xm {
	/*!
	 * some original code copied and then modified from: Chai - type utility
	 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
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
		boolean: isBoolean
	};

	function hasOwnProp(obj:any, prop:string):bool {
		return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	export function isType(obj:any, type:string):bool {
		if (hasOwnProp(typeMap, type)) {
			return typeMap[type].call(null, obj);
		}
		return false;
	}

	export function isArguments(obj:any):bool {
		return (typeOf(obj) === 'arguments');
	}

	export function isArray(obj:any):bool {
		return (typeOf(obj) === 'array');
	}

	export function isDate(obj:any):bool {
		return (typeOf(obj) === 'date');
	}

	export function isFunction(obj:any):bool {
		return (typeOf(obj) === 'function');
	}

	export function isNumber(obj:any):bool {
		return (typeOf(obj) === 'number');
	}

	export function isRegExp(obj:any):bool {
		return (typeOf(obj) === 'regexp');
	}

	export function isString(obj:any):bool {
		return (typeOf(obj) === 'string');
	}

	export function isNull(obj:any):bool {
		return (typeOf(obj) === 'null');
	}

	export function isUndefined(obj:any):bool {
		return (typeOf(obj) === 'undefined');
	}

	export function isObject(obj:any):bool {
		return (typeOf(obj) === 'object');
	}

	export function isBoolean(obj:any):bool {
		return (typeOf(obj) === 'boolean');
	}

	//clone/extend the map
	export function getTypeOfMap(add?:any) {
		var obj = {};
		for (var name in typeMap) {
			if (hasOwnProp(typeMap, name)) {
				obj[name] = typeMap[name];
			}
		}
		if (add) {
			for (var name in add) {
				if (hasOwnProp(add, name) && isFunction(add[name])) {
					obj[name] = add[name];
				}
			}
		}
		return obj;
	}

	//get a wrapper to check in the cloned/extended map
	export function getTypeOfWrap(add?:any):(obj:any, type:string) => bool {
		var typeMap = getTypeOfMap(add);
		return function isType(obj:any, type:string):bool {
			if (hasOwnProp(typeMap, type)) {
				return typeMap[type].call(null, obj);
			}
			return false;
		};
	}
}
