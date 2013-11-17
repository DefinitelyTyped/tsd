/*jshint -W003*/
function copyTo(source, target) {
	'use strict';

	target = target ? target : (Array.isArray(source) ? [] : {});
	var name;
	var value;
	if (source) {
		for (name in source) {
			if (source.hasOwnProperty(name)) {
				value = source[name];
				if (typeof value === 'object' && value) {
					target[name] = extend(value);
				}
				else {
					target[name] = value;
				}
			}
		}
	}
	return target;
}

function extend(source) {
	'use strict';

	var ret = Array.isArray(source) ? [] : {};
	copyTo(source, ret);
	for (var i = 1, ii = arguments.length; i < ii; i++) {
		copyTo(arguments[i], ret);
	}
	return ret;
}

/*jshint +W003*/
module.exports = {
	copyTo: copyTo,
	extend: extend
};
