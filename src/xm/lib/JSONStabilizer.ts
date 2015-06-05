/// <reference path="../_ref.d.ts" />

'use strict';

import detectIndent = require('detect-indent');

import CodeStyle = require('../lib/CodeStyle');
import collection = require('../collection');
import assertVar = require('../assertVar');
import typeOf = require('../typeOf');

var sniffExp = /([ \t]*).*((?:\r?\n)|$)/g;
var lastEnd = /(\r?\n)$/;

/**
 * JSONStabiliser - keep the style of manipulated (or regenerated) JSON similar to it's original
 *
 * check for line-end style, indentation and trailing space, and enforce property ordering
 */
// TODO figure out what to do with inheriting codeStyle

class JSONStabilizer {

	depth: number;
	style: CodeStyle;

	keys: string[] = [];

	parent: JSONStabilizer = null;
	children = new collection.Hash<JSONStabilizer>();

	constructor(depth: number = 2, style: CodeStyle = null) {
		this.depth = depth;
		this.style = style || new CodeStyle();
	}

	get root(): JSONStabilizer {
		if (this.parent) {
			return this.parent.root;
		}
		return this;
	}

	parseString(jsonString: string): Object {
		var object = JSON.parse(jsonString.trim());
		this.style = new CodeStyle();
		this.sniff(jsonString);
		this.snapshot(object);
		return object;
	}

	sniff(jsonString: string): void {
		assertVar(jsonString, 'string', 'jsonString');

		var eolWin = 0;
		var eolNix = 0;
		// sanity limit
		var sampleLines = 10;

		var match: RegExpExecArray;
		sniffExp.lastIndex = 0;
		// test line-end
		while (sampleLines > 0 && (match = sniffExp.exec(jsonString))) {
			sniffExp.lastIndex = match.index + (match[0].length || 1);
			sampleLines--;

			if (match[2].length > 0) {
				if (match[2] === '\r\n') {
					eolWin++;
				}
				else {
					eolNix++;
				}
			}
		}
		// trailing
		this.style.trailingEOL = false;

		if (jsonString.length > 2) {
			lastEnd.lastIndex = 0;
			match = lastEnd.exec(jsonString);
			if (match && match[1].length > 0) {
				this.style.trailingEOL = true;
				if (match[1] === '\r\n') {
					eolWin++;
				}
				else {
					eolNix++;
				}
			}
		}

		this.style.indent = detectIndent(jsonString, '  ');
		this.style.eol = (eolWin > eolNix ? '\r\n' : '\n');
	}

	snapshot(object: Object): void {
		assertVar(object, 'object', 'object');

		this.keys = Object.keys(object);
		this.children = new collection.Hash<JSONStabilizer>();

		if (this.depth > 0) {
			this.keys.forEach((key) => {
				if (typeOf.isObject(object[key])) {
					var child = new JSONStabilizer(this.depth - 1);
					child.parent = this;
					this.children[key] = child;
					child.snapshot(object[key]);
				}
			});
		}
	}

	getStablized(json: Object): Object {
		assertVar(json, 'object', 'json');

		var ret = {};
		var have = Object.keys(json);

		// TODO this should be smarter with new properties?
		this.keys.forEach((key) => {
			var i = have.indexOf(key);
			if (i > -1) {
				have.splice(i, 1);
				if (key in this.children && typeOf.isObject(json[key])) {
					ret[key] = this.children[key].getStablized(json[key]);
				}
				else {
					ret[key] = json[key];
				}
			}
		});
		have.forEach((key) => {
			// keepers
			this.keys.push(key);
			ret[key] = json[key];
		});

		return ret;
	}

	toJSONString(json: Object, assumeStable: boolean = false): string {
		assertVar(json, 'object', 'json');
		if (!assumeStable) {
			json = this.getStablized(json);
		}
		var str = JSON.stringify(json, null, this.style.indent);
		if (this.style.eol !== '\n') {
			str = str.replace(/\r?\n/g, this.style.eol);
		}
		if (this.style.trailingEOL) {
			str += this.style.eol;
		}
		return str;
	}
}

export = JSONStabilizer;
