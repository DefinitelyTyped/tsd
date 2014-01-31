/*jshint -W003*/
function copyTo(target, source) {
	target = target ? target : (Array.isArray(source) ? [] : {});
	var name;
	var value;
	if (source) {
		for (name in source) {
			if (source.hasOwnProperty(name)) {
				value = source[name];
				if (typeof value === 'object' && value) {
					target[name] = copyTo(target[name], value);
				}
				else {
					target[name] = value;
				}
			}
		}
	}
	return target;
}

function clone(source) {
	var ret = Array.isArray(source) ? [] : {};
	for (var i = 0, ii = arguments.length; i < ii; i++) {
		copyTo(ret, arguments[i]);
	}
	return ret;
}

/*jshint +W003*/
module.exports = {
	copyTo: copyTo,
	clone: clone
};
