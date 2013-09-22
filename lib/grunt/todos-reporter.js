var path = require('path');

/*jshint -W098*/

function padL(str, len, char) {
	str = '' + str;
	char = char.charAt(0);
	while (str.length < len) {
		str = char + str;
	}
	return str;
}

function padR(str, len, char) {
	str = '' + str;
	char = char.charAt(0);
	while (str.length < len) {
		str += char;
	}
	return str;
}

function color(str, level) {
	if (level === 'low') {
		return str.blue;
	}
	if (level === 'med') {
		return str.yellow;
	}
	if (level === 'high') {
		return str.red;
	}
	return str;
}

module.exports = {
	make: function (grunt) {
		'use strict';

		return {
			header: function () {
				return '';
			},
			footer: function () {
				return '\n';
			},
			fileTasks: function (file, tasks, options) {
				if (tasks.length > 0) {
					var result = 'Tasks found in: '.cyan + file.replace(/^(.*?)([^\\\/]*)$/, function (match, first, second) {
						return first + second.white;
					}) + '\n';
					tasks.forEach(function (task) {
						var line = task.line.replace(/^[ \t]*/, '').replace(/^[ \t]*\/\/[ \t]*([\w]+)[\t]*:?[ \t]*/, function (match, value) {
							return padR(value + ':', 7, ' ').bold + ' ';
						});
						result += '-> ' + path.resolve(file) + '[' + task.lineNumber + ']' + '\n';
						result += '   ' + color(padR(task.priority, 4, ' '), task.priority) + ' ' + line + '\n';
					});
					return result + '\n';
				}
				return '';
			}
		};
	}
};
