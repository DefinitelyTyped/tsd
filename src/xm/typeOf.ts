/// <reference path="./_ref.d.ts" />

'use strict';

import typeDetect = require('type-detect');

var toString = Object.prototype.toString;

export function get(value: any): string {
	return typeDetect(value);
}

export var jsonTypes: string[] = [
	'array',
	'object',
	'boolean',
	'number',
	'string',
	'null'
];

export var primitiveTypes: string[] = [
	'boolean',
	'number',
	'string'
];

export var valueTypes: string[] = [
	'boolean',
	'number',
	'string',
	'null'
];

var hasOwnProperty = Object.prototype.hasOwnProperty;

export function hasOwnProp(value: any, prop: string): boolean {
	return hasOwnProperty.call(value, prop);
}

export function isType(value: any, type: string): boolean {
	if (hasOwnProp(typeMap, type)) {
		return typeMap[type].call(null, value);
	}
	return false;
}

export function isArguments(value: any): boolean {
	return typeDetect(value) === 'arguments';
}

export function isArray(value: any): boolean {
	return typeDetect(value) === 'array';
}

export function isDate(value: any): boolean {
	return typeDetect(value) === 'date';
}

export function isFunction(value: any): boolean {
	return typeDetect(value) === 'function';
}

export function isNumber(value: any): boolean {
	return typeDetect(value) === 'number';
}

export function isRegExp(value: any): boolean {
	return typeDetect(value) === 'regexp';
}

export function isString(value: any): boolean {
	return typeDetect(value) === 'string';
}

export function isNull(value: any): boolean {
	return typeDetect(value) === 'null';
}

export function isUndefined(value: any): boolean {
	return typeDetect(value) === 'undefined';
}

export function isObject(value: any): boolean {
	return typeDetect(value) === 'object';
}

export function isBoolean(value: any): boolean {
	return typeDetect(value) === 'boolean';
}
// error?

// - - - - meta types

// TODO add more array-likes?? DOM???
export function isArrayLike(value: any): boolean {
	return (typeDetect(value) === 'array' || typeDetect(value) === 'arguments');
}

export function isOk(value: any): boolean {
	return !!value;
}

export function isFlagOn(value: any): boolean {
	if (!isValid(value)) {
		return false;
	}
	value = ('' + value).toLowerCase();
	if (value === '' || value === '0') {
		return false;
	}
	switch (value) {
		case 'false':
		case 'null':
		case 'nan':
		case 'undefined':
		// language
		case 'no':
		case 'off':
		case 'disabled':
			return false;
	}
	return true;
}

export function isValid(value: any): boolean {
	var type = typeDetect(value);
	return !(type === 'undefined' || type === 'null' || (type === 'number' && isNaN(value)));
}

export function isNaN(value: any): boolean {
	return value !== value;
}

export function isJSONValue(value: any): boolean {
	return jsonTypes.indexOf(typeDetect(value)) > -1;
}

export function isPrimitive(value: any): boolean {
	return primitiveTypes.indexOf(typeDetect(value)) > -1;
}

export function isValueType(value: any): boolean {
	return valueTypes.indexOf(typeDetect(value)) > -1;
}

// - - - -

export function isSha(value: any): boolean {
	if (typeof value !== 'string') {
		return false;
	}
	return /^[0-9a-f]{40}$/.test(value);
}

export function isShaShort(value: any): boolean {
	if (typeof value !== 'string') {
		return false;
	}
	return /^[0-9a-f]{6,40}$/.test(value);
}

export function isMd5(value: any): boolean {
	if (typeof value !== 'string') {
		return false;
	}
	return /^[0-9a-f]{32}$/.test(value);
}

export var typeMap: any = {
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
	sha1: isSha,
	md5: isMd5,
	jsonValue: isJSONValue
};

// - - - -

// clone/extend the map
export function getTypeOfMap(add?: any): Object {
	var name: string;
	var value = Object.create(null);
	for (name in typeMap) {
		if (hasOwnProp(typeMap, name)) {
			if (!isFunction(typeMap[name])) {
				throw new Error('bad typeOf function ' + name);
			}
			value[name] = typeMap[name];
		}
	}
	if (add) {
		for (name in add) {
			if (hasOwnProp(add, name) && isFunction(add[name])) {
				value[name] = add[name];
			}
		}
	}
	return value;
}

// get a wrapper to check in the cloned/extended map
export function getTypeOfWrap(add?: any): (value: any, type: string) => boolean {
	var typeMap = getTypeOfMap(add);

	return function isTypeWrap(value: any, type: string): boolean {
		if (hasOwnProp(typeMap, type)) {
			return typeMap[type].call(null, value);
		}
		return false;
	};
}
