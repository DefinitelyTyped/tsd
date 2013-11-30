/*

 miniwrite-io

 https://github.com/Bartvds/miniwrite-io

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

/*jshint -W003*/

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var miniwrite = require('miniwrite');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


// node.js file stream
//TODO add auto close?
//TODO this is buggy: won't flush on exit()
//TODO m
function disk(file, linebreak) {
	var mw = miniwrite.base();
	mw.linebreak = (typeof linebreak !== 'undefined' ? linebreak : '\n');
	mw.enabled = true;
	mw.file = file;
	var stream;
	var start = 0;
	var buffer = miniwrite.buffer();
	var streaming = {
		writeln: function (line) {
			var buff = new Buffer(line + mw.linebreak, 'utf8');
			start += buff.length;
			stream.write(buff);
		}
	};
	var active = buffer;
	var splitter = miniwrite.splitter({
		writeln: function (line) {
			active.writeln(line);
		}
	});

	var opening = false;
	var initing = false;
	(function () {
		initing = true;
		function finalKill(err){
			initing = false;
			if (err) {
				console.log(err);
				return;
			}
			// auto start
			start = 0;
			if (buffer.lines.length > 0) {
				open(mw.file);
				return;
			}
			// and done already
			if (flushCallback.length > 0) {
				doFlush();
			}
		}

		fs.exists(mw.file, function(exists) {
			if (!exists) {
				finalKill();
				return;
			}
			fs.truncate(mw.file, 0, finalKill);
		});
	}());

	function open(dest) {
		if (!stream && !opening) {
			opening = true;
			mkdirp(path.dirname(dest), function (err) {
				opening = false;
				if (err) {
					console.log(err);
					return;
				}
				stream = fs.createWriteStream(dest, {
					start: start,
					flags: (start === 0 ? 'w' : 'a'),
					encoding: 'utf8',
					mode: 0666
				});
				active = streaming;
				//flush buffer
				buffer.lines.forEach(function (line) {
					active.writeln(line);
				});
				buffer.clear();

				// and done already
				if (flushCallback.length > 0) {
					doFlush();
				}
			});
		}
	}

	mw.writeln = function (line) {
		//console.log('writeln >' + line + '<');
		if (mw.enabled) {
			if (!stream) {
				open(mw.file);
			}
			splitter.writeln(line);
		}
	};

	var flushCallback = [];
	function doFlush() {
		if (initing || opening) {
			return;
		}
		active = buffer;
		var callbackList = flushCallback;
		flushCallback = [];
		if (stream) {
			stream.on('finish', function () {
				callbackList.forEach(function(callback) {
					callback(mw);
				});
			});
			stream.end();
			stream = null;
			return;
		}
		process.nextTick(function () {
			callbackList.forEach(function(callback) {
				callback(mw);
			});
		});
	}
	mw.flush = function (callback) {
		flushCallback.push(callback);
		doFlush();
	};
	mw.toString = function () {
		return '<miniwrite-disk>';
	};
	return mw;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

module.exports = {
	disk: disk
};
