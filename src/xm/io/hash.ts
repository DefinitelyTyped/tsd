/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../typeOf.ts" />
///<reference path="../inspect.ts" />

module xm {
	'use strict';

	var crypto = require('crypto');

	export function md5(data:string):string {
		return crypto.createHash('md5').update(data).digest('hex');
	}

	export function sha1(data:string):string {
		return crypto.createHash('sha1').update(data).digest('hex');
	}

	export function sha1Short(data:string, length:number = 8):string {
		return crypto.createHash('sha1').update(data).digest('hex').substring(0, length);
	}

	// hash any json-like-object's data to a ident-string
	// - instances with identical fields and values give identical ident-string
	// - output looks similar to json-string but with auto-sorted property order and other tweaks
	// - non-reversible
	// - can be lengthy: re-hash with md5/sha
	export function jsonToIdent(obj:any):string {
		var ret = '';
		var sep = ';';
		var type = xm.typeOf(obj);
		if (type === 'string' || type === 'number' || type === 'boolean') {
			ret += JSON.stringify(obj) + sep;
		}
		else if (type === 'regexp' || type === 'function') {
			// we could, but let's not
			throw (new Error('jsonToIdent: cannot serialise: ' + type));
		}
		else if (type === 'date') {
			// funky to be unique type and include get milliseconds
			ret += '<Date>' + obj.getTime() + sep;
		}
		else if (type === 'array') {
			ret += '[';
			obj.forEach((value) => {
				ret += jsonToIdent(value);
			});
			ret += ']' + sep;
		}
		// object last
		else if (type === 'object') {
			var keys = Object.keys(obj);
			keys.sort();
			ret += '{';
			keys.forEach((key:string) => {
				ret += JSON.stringify(key) + ':' + jsonToIdent(obj[key]);
			});
			ret += '}' + sep;
		}
		else if (type === 'null') {
			ret += 'null';
		}
		else {
			throw (new Error('jsonToIdent: cannot serialise value: ' + xm.toValueStrim(obj)));
		}
		return ret;
	}

	export function jsonToIdentHash(obj:any, length:number = 0):string {
		var ident = sha1(jsonToIdent(obj));
		if (length > 0) {
			ident = ident.substr(0, length);
		}
		return ident;
	}
}
