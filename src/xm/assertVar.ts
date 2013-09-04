/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

module xm {

	function isArray(value:any):bool {
		return Array.isArray(value);
	}

	function isObject(value:any):bool {
		return typeof value === 'object' && value && !isArray(value);
	}

	function isNumber(value:any):bool {
		return typeof value === 'number' && !isNaN(value);
	}

	function isSha(value:any):bool {
		if (typeof value !== 'string') {
			return false;
		}
		return /^[0-9a-f]{40}$/.test(value);
	}

	function isMd5(value:any):bool {
		if (typeof value !== 'string') {
			return false;
		}
		return /^[0-9a-f]{32}$/.test(value);
	}

	var typeAssert:any = {
		sha1: isSha,
		md5: isMd5,
		object: isObject,
		array: isArray,
		number: isNumber
	};

	/*
	 assertVar: assert a variable (like a function argument) and throw informative error on assertion failure
	 */
	//TODO write tests
	//TODO expand validation options, add RegExp /string length
	//TODO custom error?
	export function assertVar(label:string, value:any, type:any, opt?:bool = false):void {
		if (arguments.length < 3) {
			throw (new Error('assertVar() expected at least 3 arguments but got "' + value + '"'));
		}
		var valueType = typeof value;
		var typeKind = typeof type;

		// undefined or null
		if (valueType === 'undefined' || (!value && valueType === 'object')) {
			if (!opt) {
				throw (new Error('expected "' + label + '" to be defined but got "' + value + '"'));
			}
		}
		else if (typeKind === 'function') {
			if (value.constructor instanceof type) {
				throw (new Error('expected "' + label + '" to be instanceof "' + type + '" but got "' + value.constructor + '": ' + value));
			}
		}
		else if (typeKind === 'string') {
			if (typeAssert.hasOwnProperty(type)) {
				var check = typeAssert[type];
				if (!check(value)) {
					throw (new Error('expected "' + label + '" to be a "' + type + '": ' + value));
				}
			}
			else if (valueType !== type) {
				throw (new Error('expected "' + label + '" to be typeof "' + type + '" but got "' + valueType + '": ' + value));
			}
		}
		else {
			throw (new Error('bad type assertion parameter "' + type + '" for "' + label + '"'));
		}
	}
}
