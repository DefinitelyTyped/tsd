module xm {

	var _:UnderscoreStatic = require('underscore');

	export function md5(data:string):string {
		var crypto = require('crypto');
		return crypto.createHash('md5').update(data).digest('hex');
	}

	export function sha1(data:string):string {
		var crypto = require('crypto');
		return crypto.createHash('sha1').update(data).digest('hex');
	}

	// hash json-like data to string
	export function jsonToIdent(obj:any):string {
		var ret = '';
		var sep = ';';
		if (_.isString(obj)) {
			ret += JSON.stringify(obj) + sep;
		}
		else if (_.isNumber(obj)) {
			ret += JSON.stringify(obj) + sep;
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
		else if (_.isFunction(obj)) {
			// we could, but let's not
			throw (new Error('cannot serialise Function'));
		}
		else if (_.isRegExp(obj)) {
			// we could, but let's not
			throw (new Error('cannot serialise RegExp'));
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
			throw (new Error('cannot serialise value:' + obj));
		}
		return ret;
	}
}