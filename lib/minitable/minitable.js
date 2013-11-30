var miniwrite = require('miniwrite');
var ministyle = require('ministyle');

/*jshint -W098*/

/*
var simpleCell = {
	collapse: true,
	max: 0,
	min: 0,
	padding: {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	}
};

var blockTypes = {
	'table': {
		cols: [
			simpleCell
		]
	}
};

*/
var blockTypes = {
};

function getBuilder(out, style, maxWidth) {
	'use strict';
	maxWidth = (typeof maxWidth === 'number' ? maxWidth : maxWidth);
	/*
	 var blocks = [];

	 var current = [];

	 function getBlock(type) {

	 }

	 function getRow() {

	 }


	 function defineType(type, settings) {

	 }

	 var table = {

	 };*/
}
function getMultiChain(obj, debug) {
	var channels = {
		plain: {
			chars: miniwrite.chars(miniwrite.buffer()),
			style: ministyle.plain()
		}
	};
	if (obj) {
		Object.keys(obj).forEach(function (style) {
			if (!channels[style]) {
				channels[style] = {};
			}
			channels[style].chars = miniwrite.chars(obj[style].write|| miniwrite.buffer());
			channels[style].style = (obj[style].style || ministyle.plain());
		});
	}
	if (debug) {
		if (!channels.debug) {
			channels.debug = {};
		}
		channels.debug.chars = miniwrite.chars(miniwrite.log());
		channels.debug.style = ministyle.plain();
	}

	var multiOut = {
		channels: channels,
		chain: null
	};

	var channelNames = Object.keys(channels);

	function getWrite(type) {
		return function (str) {
			if (typeof str === 'undefined') {
				return chain;
			}
			for (var i = 0, ii = channelNames.length; i < ii; i++) {
				var channel = channels[channelNames[i]];
				channel.chars.write(channel.style[type](str));
			}
			return chain;
		};
	}

	function getLine(char) {
		if (typeof char === 'undefined') {
			char = '';
		}
		return function (str) {
			if (typeof str === 'undefined') {
				str = '' + char;
			}
			for (var i = 0, ii = channelNames.length; i < ii; i++) {
				channels[channelNames[i]].chars.writeln(str);
			}
			return chain;
		};
	}

	// write unstyled
	function getChar(char) {
		if (typeof char === 'undefined') {
			char = '';
		}
		return function (str) {
			if (typeof str === 'undefined') {
				str = '' + char;
			}
			for (var i = 0, ii = channelNames.length; i < ii; i++) {
				channels[channelNames[i]].chars.write(str);
			}
			return chain;
		};
	}

	var chain = {};
	ministyle.getStyleNames().forEach(function (name) {
		chain[name] = getWrite(name);
	});
	chain.ln = getLine();
	chain.sp = getChar(' ');
	multiOut.chain = chain;

	return multiOut;
}

module.exports = {
	getBuilder: getBuilder,
	getMultiChain: getMultiChain
};
