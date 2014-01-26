var JSON5 = require('json5');
var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

function toJSON5(src) {
	var dest = path.join(path.dirname(src), path.basename(src, path.extname(src)) + '.json5');
	var obj = JSON.parse(fs.readFileSync(src, 'utf8'));
	fs.writeFileSync(dest, JSON5.stringify(obj, null, 4), 'utf8');
}

function toYAML(src) {
	var dest = path.join(path.dirname(src), path.basename(src, path.extname(src)) + '.yml');
	var obj = JSON.parse(fs.readFileSync(src, 'utf8'));
	fs.writeFileSync(dest, yaml.safeDump (obj, {
		indent : 4
	}), 'utf8');
}

exports.convert = function convert(src) {
	toJSON5(src);
	toYAML(src);
};

exports.toJSON5 = toJSON5;
exports.toYAML = toYAML;
