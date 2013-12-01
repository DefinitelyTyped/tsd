var miniwrite = require('miniwrite');
var ministyle = require('ministyle');

/*jshint -W098*/

//TODO add auto optimiser for when we only have one or two channels
function getMultiChain(obj) {
	var channels = {};
	if (obj) {
		Object.keys(obj).forEach(function (styleName) {
			if (!channels[styleName]) {
				channels[styleName] = {};
			}
			var output = (obj[styleName].write || miniwrite.buffer());
			channels[styleName].chars = miniwrite.chars(output);
			channels[styleName].style = (obj[styleName].style || ministyle.plain());
		});
	}

	// .out is the chaining interface.
	// .channels contains the in specified write/style combinationss
	var multiOut = {
		channels: channels,
		out: null
	};

	var channelNames = Object.keys(channels);

	function getStyle(name) {
		return function (str) {
			str = String(str);
			//TODO fix optimal way to wrap style per line
			for (var i = 0, ii = channelNames.length; i < ii; i++) {
				var channel = channels[channelNames[i]];
				var lines = str.split(channel.chars.splitExp);
				for (var j = 0; j < lines.length; j++) {
					if (lines[j].length > 0) {
						channel.chars.write(channel.style[name](lines[j]));
						if (j < lines.length - 1 ) {
							channel.chars.writeln('');
						}
					}
				}
			}
			return out;
		};
	}

	function getLine(pre, post) {
		if (typeof pre === 'undefined') {
			pre = '';
		}
		if (typeof post === 'undefined') {
			post = '';
		}
		return function (str) {
			if (arguments.length === 0) {
				str = '';
			}
			for (var i = 0, ii = channelNames.length; i < ii; i++) {
				channels[channelNames[i]].chars.writeln(pre + str + post);
			}
			return out;
		};
	}

	// write unstyled
	function getChar(pre, post) {
		if (typeof pre === 'undefined') {
			pre = '';
		}
		if (typeof post === 'undefined') {
			post = '';
		}
		return function (str) {
			if (arguments.length === 0) {
				str = '';
			}
			for (var i = 0, ii = channelNames.length; i < ii; i++) {
				channels[channelNames[i]].chars.write(pre + str + post);
			}
			return out;
		};
	}

	var out = {};
	ministyle.getStyleNames().forEach(function (name) {
		out[name] = getStyle(name);
	});
	out.line = getLine();
	out.ln = getLine();
	out.sp = getChar(' ');
	//TODO expand and add more chainebles
	out.indent = getChar('   ');

	multiOut.out = out;
	return multiOut;
}

module.exports = {
	getMultiChain: getMultiChain
};
