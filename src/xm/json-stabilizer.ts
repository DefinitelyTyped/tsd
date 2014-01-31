/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */
/// <reference path="../_ref.d.ts" />
/// <reference path="assertVar.ts" />

module xm {
	'use strict';

	var sniffExp = /([ \t]*).*((?:\r?\n)|$)/g;
	var lastEnd = /(\r?\n)$/;

	var detectIndent = require('detect-indent');

	/**
	 * JSONStabiliser - keep the style of manipulated (or regenerated) JSON similar to it's original
	 *
	 * check for line-end style, indentation and trailing space, and enforce property ordering
	 */
	// TODO figure out what to do with inheriting codeStyle
	export class JSONStabilizer {

		depth:number;
		style:CodeStyle;

		keys:string[] = [];

		parent:JSONStabilizer = null;
		children:Map<string, JSONStabilizer> = new Map();

		constructor(depth:number = 2, style:CodeStyle = null) {
			this.depth = depth;
			this.style = style || new CodeStyle();
		}

		get root():JSONStabilizer {
			if (this.parent) {
				return this.parent.root;
			}
			return this;
		}

		parseString(jsonString:string):Object {
			var object = JSON.parse(jsonString);
			this.style = new CodeStyle();
			this.sniff(jsonString);
			this.snapshot(object);
			return object;
		}

		sniff(jsonString:string):void {
			xm.assertVar(jsonString, 'string', 'jsonString');

			var eolWin = 0;
			var eolNix = 0;
			// sanity limit
			var sampleLines = 10;

			var match:RegExpExecArray;
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

		snapshot(object:Object):void {
			xm.assertVar(object, 'object', 'object');

			this.keys = Object.keys(object);
			this.children = new Map();

			if (this.depth > 0) {
				this.keys.forEach((key) => {
					if (xm.isObject(object[key])) {
						var child = new JSONStabilizer(this.depth - 1);
						child.parent = this;
						this.children[key] = child;
						child.snapshot(object[key]);
					}
				});
			}
		}

		getStablized(json:Object):Object {
			xm.assertVar(json, 'object', 'json');

			var ret = {};
			var have = Object.keys(json);

			// TODO this should be smarter with new properties?
			this.keys.forEach((key) => {
				var i = have.indexOf(key);
				if (i > -1) {
					have.splice(i, 1);
					if (key in this.children && xm.isObject(json[key])) {
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

		toJSONString(json:Object, assumeStable:boolean = false):string {
			xm.assertVar(json, 'object', 'json');
			if (!assumeStable) {
				json = this.getStablized(json);
			}
			var str = JSON.stringify(json, null, this.style.indent);
			if (this.style.eol !== '\n') {
				str = str.replace(/\n/g, this.style.eol);
			}
			if (this.style.trailingEOL) {
				str += this.style.eol;
			}
			return str;
		}
	}

	export class CodeStyle {

		eol:string = '\n';
		indent:string = '  ';
		trailingEOL:boolean = true;

		clone():CodeStyle {
			var style = new CodeStyle();
			style.eol = this.eol;
			style.indent = this.indent;
			style.trailingEOL = this.trailingEOL;
			return style;
		}
	}

	/**
	 * JSONStabilizerMap - weakly associate JSONStabilizer's and their objects
	 */
	export class JSONStabilizerMap {

		depth:number;
		style:CodeStyle;

		map:WeakMap<Object, JSONStabilizer> = new WeakMap();

		constructor(depth:number = 2, style:CodeStyle = null) {
			this.depth = depth;
			this.style = style || new CodeStyle();
		}

		/**
		 * parse string to an object and sniff/snapshot and associate
		 */
		parseString(jsonString:string):Object {
			var stable:JSONStabilizer = new JSONStabilizer(this.depth, this.style.clone());
			this.map.set(object, stable);
			return stable.parseString(jsonString);
		}

		/**
		 *  associate existing object
		 */
		associate(object:Object, snapshotNow:boolean = true):JSONStabilizer {
			var stable:JSONStabilizer;
			if (!this.map.has(object)) {
				stable = new JSONStabilizer(this.depth, this.style.clone());
				this.map.set(object, stable);
			}
			else {
				stable = this.map.get(object);
			}
			if (snapshotNow) {
				stable.snapshot(object);
			}
			return stable;
		}

		/**
		 * wrapper: convert object to stabilized string
		 */
		toJSONString(object:Object):string {
			var stable:JSONStabilizer;
			if (!this.map.has(object)) {
				stable = new JSONStabilizer(this.depth, this.style.clone());
				this.map.set(object, stable);
				stable.snapshot(object);
			}
			else {
				stable = this.map.get(object);
			}
			return stable.toJSONString(object);
		}
	}
}
