/// <reference path="./_ref.d.ts" />

'use strict';

import crypto = require('crypto');
import typeDetect = require('type-detect');

interface Updater {
	update(value: string): void;
}

export function md5(data: any): string {
	return crypto.createHash('md5').update(data).digest('hex');
}

export function sha1(data: any): string {
	return crypto.createHash('sha1').update(data).digest('hex');
}

// don't trim additional whitespace
// var hashNormExp = /^\s+|(?:\s*?[\r\n]\s*)|\s+$/g;
var hashNormExp = /[\r\n]+/g;
var hashNew = '\n';

export function hashNormalines(input: string): string {
	return sha1(input.replace(hashNormExp, hashNew));
}

// hash any json-like-object
// - instances with identical fields and values give identical ident-string
// - auto-sorted property order and other tweaks
// - non-reversible
function hashStep(hasher: Updater, obj: any): void {
	var sep = ';';
	var type = typeDetect(obj);
	switch (type) {
		case 'number':
		case 'boolean':
		case 'null':
			hasher.update(String(obj) + sep);
			break;
		case 'string':
			hasher.update(JSON.stringify(obj) + sep);
			break;
		case 'array':
			hasher.update('[');
			obj.forEach((value: any) => {
				hashStep(hasher, value);
			});
			hasher.update(']' + sep);
			break;
		case 'object':
			var keys = Object.keys(obj);
			keys.sort();
			hasher.update('{');
			keys.forEach((key: string) => {
				hasher.update(JSON.stringify(key) + ':');
				hashStep(hasher, obj[key]);
			});
			hasher.update('}' + sep);
			break;
		case 'date':
			hasher.update('<Date>' + obj.getTime() + sep);
			break;
		case 'buffer':
			hasher.update('<Buffer>');
			hasher.update(obj);
			hasher.update(sep);
			break;
		case 'regexp':
			// hasher.update('<Regexp>' + String(obj) + sep);
			// we could, but let's not
			throw (new Error('jsonToIdent: cannot serialise regexp'));
		case 'function':
			// we could, but let's not
			throw (new Error('jsonToIdent: cannot serialise function'));
		default:
			throw (new Error('jsonToIdent: cannot serialise value: ' + String(obj)));
	}
}

export function jsonToIdentHash(obj: any, length: number = 0): string {
	var hash = crypto.createHash('sha1');
	hashStep(hash, obj);
	if (length > 0) {
		return hash.digest('hex').substr(0, Math.min(length, 40));
	}
	return hash.digest('hex');
}
