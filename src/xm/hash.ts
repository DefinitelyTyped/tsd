/// <reference path="./_ref.d.ts" />

import crypto = require('crypto');
import inspect = require('./inspect');
import typeOf = require('./typeOf');

export function md5(data: any): string {
	return crypto.createHash('md5').update(data).digest('hex');
}

export function sha1(data: any): string {
	return crypto.createHash('sha1').update(data).digest('hex');
}

export function sha1Short(data: any, length: number = 8): string {
	return crypto.createHash('sha1').update(data).digest('hex').substring(0, length);
}

// don't trim additional whitespace
// var hashNormExp = /^\s+|(?:\s*?[\r\n]\s*)|\s+$/g;
var hashNormExp = /[\r\n]+/g;
var hashNew = '\n';

export function hashNormalines(input: string): string {
	return sha1(input.replace(hashNormExp, hashNew));
}

// hash any json-like-object's data to a ident-string
// - instances with identical fields and values give identical ident-string
// - output looks similar to json-string but with auto-sorted property order and other tweaks
// - non-reversible
// - can be lengthy: re-hash with md5/sha
export function jsonToIdent(obj: any): string {
	var ret = '';
	var sep = ';';
	var type = typeOf.get(obj);
	if (type === 'string' || type === 'number' || type === 'boolean') {
		ret += JSON.stringify(obj) + sep;
	}
	else if (type === 'regexp' || type === 'function') {
		// we could, but let's not
		throw (new Error('jsonToIdent: cannot serialise: ' + type));
	}
	else if (type === 'date') {
		// funky to be unique type
		ret += '<Date>' + obj.getTime() + sep;
	}
	else if (type === 'array') {
		ret += '[';
		obj.forEach((value: any) => {
			ret += jsonToIdent(value);
		});
		ret += ']' + sep;
	}
	// object last
	else if (type === 'object') {
		var keys = Object.keys(obj);
		keys.sort();
		ret += '{';
		keys.forEach((key: string) => {
			ret += JSON.stringify(key) + ':' + jsonToIdent(obj[key]);
		});
		ret += '}' + sep;
	}
	else if (type === 'null') {
		ret += 'null';
	}
	else {
		throw (new Error('jsonToIdent: cannot serialise value: ' + inspect.toValueStrim(obj)));
	}
	return ret;
}

export function jsonToIdentHash(obj: any, length: number = 0): string {
	var ident = sha1(jsonToIdent(obj));
	if (length > 0) {
		ident = ident.substr(0, length);
	}
	return ident;
}
