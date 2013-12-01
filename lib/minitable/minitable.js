/*

 minitable

 https://github.com/Bartvds/minitable

 Copyright (c) 2013 Bart van der Schoor

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
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
var ministyle = require('ministyle');
var miniformat = require('../miniformat/miniformat');
var lib = require('../lib');

/*jshint -W098*/

var util = require('util');

function repeat(amount, char) {
	char = String(char).charAt(0);
	var ret = '';
	for (var i = 0; i < amount; i++) {
		ret += char;
	}
	return ret;
}
function appendL(input, amount, char) {
	char = String(char).charAt(0);
	input = String(input);
	for (var i = 0; i < amount; i++) {
		input = char + input;
	}
	return input;
}
function appendR(input, amount, char) {
	char = String(char).charAt(0);
	input = String(input);
	for (var i = 0; i < amount; i++) {
		input = input + char;
	}
	return input;
}
function appendC(input, amount, char) {
	char = String(char).charAt(0);
	input = String(input);
	var i;
	var pad = Math.floor(amount * 0.5);
	for (i = 0; i < pad; i++) {
		input = char + input;
	}
	pad = amount - pad;
	for (i = 0; i < pad; i++) {
		input = input + char;
	}
	return input;
}

function alignSide(input, amount, char, side) {
	if (side === 'right') {
		return appendL(input, amount, char);
	}
	else if (side === 'center') {
		return appendC(input, amount, char);
	}
	return appendR(input, amount, char);
}

function maxLineDimension(lines, current) {
	if (!current || typeof current !== 'object') {
		current = {
			height: 0,
			width: 0
		};
	}
	current.height = Math.max(current.height, lines.length);
	current.width = lines.reduce(function (memo, line) {
		return Math.max(memo, line.length);
	}, current.width);
	return current;
}

function hasLines(row) {
	return Object.keys(row).some(function (name) {
		return row[name].plain.lines.length > 0;
	});
}

function getMaxHeight(row) {
	return Object.keys(row).reduce(function (memo, colName) {
		return Math.max(memo, row[colName].channels.plain.chars.target.lines.length);
	}, 0);
}

function getBuilder(target, style) {
	'use strict';
	//maxWidth = (typeof maxWidth === 'number' ? maxWidth : maxWidth);

	var blockTypes = Object.create(null);
	var blocks = [];
	var output = miniwrite.chars(target);

	// a block of rows written by a handle
	function getBlock(handle) {
		var block = {
			handle: handle,
			rows: []
		};
		blocks.push(block);
		return block;
	}

	// get a miniformat-multiChain to write both plain text as well as a 'fancy' text lines version of each cell
	function getRowChainHeads(collumns) {
		var row = Object.create(null);
		Object.keys(collumns).forEach(function (name) {
			row[name] = miniformat.getMultiChain({
				plain: {
					write: miniwrite.buffer(),
					style: ministyle.plain()
				},
				display: {
					write: miniwrite.buffer(),
					style: style
				}
			});
		});
		return row;
	}

	function createBlockType(id, cols, params) {
		var block;
		// write handle
		var handle = {
			id: id,
			//TODO properly merge vars
			params: lib.copyTo({
				outer: '',
				inner: '',
				halign: 'left',
				padChar: ' ',
				fillChar: ' ',
				rowSpace: 0
			}, params),
			collumns: {},
			colNames: [],
			row: null,
			init: function () {
				if (!block) {
					return handle.next();
				}
				if (!handle.row) {
					handle.row = getRowChainHeads(handle.collumns);
					block.rows.push(handle.row);
				}
				return handle.row;
			},
			next: function () {
				if (!block) {
					newBlock();
					return handle.row;
				}
				handle.row = getRowChainHeads(handle.collumns);
				block.rows.push(handle.row);
				return handle.row;
			},
			split: function () {
				return newBlock();
			},
			close: function () {
				block = null;
				// TODO signal for flush if sync is false
				return handle;
			}
		};
		blockTypes[id] = handle;

		function newBlock() {
			block = getBlock(handle);
			// TODO signal for flush if sync is false
			handle.row = getRowChainHeads(handle.collumns);
			block.rows.push(handle.row);
			return block;
		}

		cols.forEach(function (col, index) {
			var collumn = {
				index: index,
				name: col.name,
				sync: (!!col.sync),
				halign: (col.halign || handle.params.halign),
				padChar: (col.padChar || handle.params.padChar),
				fillChar: (col.fillChar || handle.params.fillChar),
				head: (col.useHead ? (col.head || name) : ''),
				collapse: (!!col.collapse)
			};
			handle.colNames[index] = col.name;
			handle.collumns[col.name] = collumn;
		});

		return handle;
	}

	function getBlockType(id) {
		if (id in blockTypes) {
			return blockTypes[id];
		}
		return null;
	}

	function flushOutput() {
		//console.log('flushOutput');
		//console.log(util.inspect(blocks, false, 2));

		var typeStats = Object.create(null);
		// precreate
		Object.keys(blockTypes).forEach(function (id) {
			typeStats[id] = {};
		});

		// warning: epic reference chaining ahead

		//TODO optimise everything (ditch prototype code)

		//loop once to get info
		blocks.forEach(function (block) {
			//console.log(block.handle.id);

			var stats = typeStats[block.handle.id];
			block.rows.forEach(function (row) {
				Object.keys(row).forEach(function (colName) {
					var cell = row[colName];
					//console.log('   ' + colName);
					//console.log('   ' + colName + ': ' + cell.channels.plain.chars.target.concat('\n', '', false));

					//flush all
					Object.keys(cell.channels).forEach(function (channelName) {
						cell.channels[channelName].chars.flush();
					});
					//calc max size
					stats[colName] = maxLineDimension(cell.channels.plain.chars.target.lines, stats[colName]);
					//console.log(util.inspect(col.channels.plain.chars.target, false, 4));
				});
			});
		});
		//console.log(util.inspect(typeStats, false, 4));

		// lets output
		blocks.forEach(function (block, blockI) {
			var stats = typeStats[block.handle.id];
			var params = block.handle.params;
			var colNames = block.handle.colNames;

			block.rows.forEach(function (row, rowI) {
				var maxHeight = getMaxHeight(row);

				for (var y = 0; y < maxHeight; y++) {
					output.write(params.outer);

					for (var colNum = 0, colLim = colNames.length; colNum < colLim; colNum++) {
						var colName = colNames[colNum];
						var col = block.handle.collumns[colName];
						var cell = row[colName];
						var stat = stats[colName];
						var base = cell.channels.plain.chars.target.lines;
						var lines = cell.channels.display.chars.target.lines;

						if (y < base.length) {
							output.write(alignSide(lines[y], (stat.width - base[y].length), col.padChar, col.halign));
						}
						else {
							output.write(repeat(stat.width, col.fillChar));
						}
						if (colNum < colLim - 1) {
							output.write(params.inner);
						}
					}
					output.writeln(params.outer);
				}

				if (params.rowSpace > 0 && rowI < block.rows.length - 1) {
					for (var i = 0; i < params.rowSpace; i++) {
						output.writeln('');
					}
				}
			});
		});
	}

	function clear() {
		blocks = [];
	}

	var builder = {
		createType: createBlockType,
		getType: getBlockType,
		flush: flushOutput,
		clear: clear
	};
	return builder;
}

module.exports = {
	getBuilder: getBuilder
};
