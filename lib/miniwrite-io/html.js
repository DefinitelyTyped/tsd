/*
 miniwrite

 https://github.com/Bartvds/miniwrite

 Copyright (c) 2013 Bart van der Schoor

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without mw.targets.lengthitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var miniwrite = require('miniwrite');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function getAttributes(attributes) {
	var t = typeof attributes;
	if (t === 'string') {
		return attributes;
	}
	if (t === 'object') {
		return Object.keys(attributes).reduce(function (memo, key) {
			memo.push(key + '="' + attributes[key] + '"');
			return memo;
		}, []).join(' ');
	}
	return '';
}

function getHTMLWrap(tag, attributes, linebreak) {
	tag = (tag || 'span');
	attributes = getAttributes(attributes);
	linebreak = (typeof linebreak !== 'undefined' ? linebreak : '\n');

	var pre = '<' + tag + (attributes.length > 0 ? ' ' + attributes : '') + '>';
	var post = '</' + tag + '>' + linebreak;

	return function (str) {
		return pre + str + post;
	};
}

function getHTMLSpanWrap() {
	return getHTMLWrap('span', 'style="white-space:pre;font-family:monospace;"', '\n');
}

function getHTMLDomAppend(tag, attributes) {
	tag = (tag || 'span');
	attributes = getAttributes(attributes);

	var keys = Object.keys(attributes);
	if (keys.length === 0) {
		return function (str) {
			var elem = document.createElement(tag);
			elem.appendChild(document.createTextNode(str));
			return elem;
		};
	}

	return function (str) {
		var elem = document.createElement(tag);
		elem.appendChild(document.createTextNode(str));
		for (var i = 0, ii = keys.length; i < ii; i++) {
			var atr = document.createAttribute(keys[i]);
			atr.nodeValue = attributes[keys[i]];
			elem.setAttributeNode(atr);
		}
		return elem;
	};
}

function htmlString(target, tag, attributes, linebreak) {
	var wrap = getHTMLWrap((tag || 'span'), (attributes || {style: 'white-space:pre;font-family:monospace;'}), linebreak);
	var mw = miniwrite.base();
	mw.enabled = true;
	mw.target = target;
	mw.writeln = function (line) {
		if (mw.enabled) {
			mw.target.writeln(wrap(line));
		}
	};
	return mw;
}

function htmlAppend(parent, tag, attributes) {
	var wrap = getHTMLDomAppend((tag || 'span'), (attributes || {style: 'white-space:pre;font-family:monospace;'}));
	var mw = miniwrite.base();
	mw.enabled = true;
	mw.parent = parent;
	mw.writeln = function (line) {
		if (mw.enabled) {
			mw.parent.appendChild(wrap(line));
		}
	};
	return mw;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

module.exports = {
	getHTMLWrap: getHTMLWrap,
	getHTMLSpanWrap: getHTMLSpanWrap,
	getHTMLDomAppend: getHTMLDomAppend,

	htmlString: htmlString,
	htmlAppend: htmlAppend
};
