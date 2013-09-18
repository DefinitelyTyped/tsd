/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

module xm {

	var crypto = require('crypto');
	var _ = require('underscore');

	export function md5(data:string):string {
		return crypto.createHash('md5').update(data).digest('hex');
	}

	export function sha1(data:string):string {
		return crypto.createHash('sha1').update(data).digest('hex');
	}

	export function sha1Short(data:string):string {
		return crypto.createHash('sha1').update(data).digest('hex').substring(0, 8);
	}

	// hash any json-like-object's data to a ident-string
	// - instances with identical fields and values give identical ident-string
	// - output looks similar to json-string but with auto-sorted property order and other tweaks
	// - non-reversible
	// - can be lengthy: re-hash with md5/sha
	export function jsonToIdent(obj:any):string {
		var ret = '';
		var sep = ';';
		var type = typeof obj;
		if (type === 'string') {
			ret += JSON.stringify(obj) + sep;
		}
		else if (type === 'number') {
			ret += JSON.stringify(obj) + sep;
		}
		else if (type === 'boolean') {
			ret += String(obj) + sep;
		}
		else if (_.isDate(obj)) {
			// funky to be unique type and include get milliseconds
			ret += '<Date>' + obj.getTime() + sep;
		}
		else if (_.isArray(obj)) {
			ret += '[';
			_.forEach(obj, (value) => {
				ret += jsonToIdent(value);
			});
			ret += ']' + sep;
		}
		else if (type === 'function') {
			// we could, but let's not
			throw (new Error('jsonToIdent: cannot serialise Function'));
		}
		else if (_.isRegExp(obj)) {
			// we could, but let's not
			throw (new Error('jsonToIdent: cannot serialise RegExp'));
		}
		// object last
		else if (_.isObject(obj)) {
			var keys = _.keys(obj);
			keys.sort();
			ret += '{';
			_.forEach(keys, (key:string) => {
				ret += JSON.stringify(key) + ':' + jsonToIdent(obj[key]);
			});
			ret += '}' + sep;
		}
		else {
			throw (new Error('jsonToIdent: cannot serialise value: ' + obj));
		}
		return ret;
	}

	export function jsonToIdentHash(obj:any, length:number=0):string {
		var ident = sha1(jsonToIdent(obj));
		if (length > 0) {
			ident = ident.substr(0, length);
		}
		return ident;
	}
}