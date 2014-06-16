/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');
import Lazy = require('lazy.js');

import assertVar = require('../../xm/assertVar');

var splitExp = /(?:(.*)(\r?\n))|(?:(.+)($))/g;

// TODO replace reference node RegExp with a xml parser (tony the pony)
var referenceTagExp = /\/\/\/[ \t]+<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

/*
 Bundle - file to bundle <reference/> 's

 complicated from trying to keep file structure mostly intact after manipulating the file

 with auto-eol detector
 */
// TODO optimise text content (keep as block)
class Bundle {

	private lines: BundleLine[] = [];
	private last: BundleLine = null;
	private map: {[key: string]: BundleLine} = Object.create(null);
	private eol: string = '\n';

	// location of the .d.ts file
	public target: string;
	// base folder when adding relative refs
	public baseDir: string;

	constructor(target: string, baseDir?: string) {
		assertVar(target, 'string', 'target');

		this.target = target.replace(/^\.\//, '');
		this.baseDir = baseDir || path.dirname(this.target);
	}

	parse(content: string): void {
		this.eol = '\n';

		var lineMatch: RegExpExecArray;
		var refMatch: RegExpExecArray;
		var line: BundleLine;

		var eolWin = 0;
		var eolNix = 0;

		splitExp.lastIndex = 0;
		while ((lineMatch = splitExp.exec(content))) {
			splitExp.lastIndex = lineMatch.index + lineMatch[0].length;

			line = new BundleLine(lineMatch[1]);

			this.lines.push(line);

			if (/\r\n/.test(lineMatch[2])) {
				eolWin++;
			}
			else {
				eolNix++;
			}

			referenceTagExp.lastIndex = 0;
			refMatch = referenceTagExp.exec(lineMatch[1]);

			if (refMatch && refMatch.length > 1) {
				// clean-up path
				line.ref = path.resolve(this.baseDir, refMatch[1]);

				this.map[line.ref] = line;
				this.last = line;
			}
		}

		// auto detect
		this.eol = (eolWin > eolNix ? '\r\n' : '\n');
	}

	has(ref: string): boolean {
		ref = path.resolve(this.baseDir, ref);
		return (ref in this.map);
	}

	append(ref: string): string {
		ref = path.resolve(this.baseDir, ref);

		if (!this.has(ref)) {
			var line = new BundleLine('', ref);

			this.map[ref] = line;

			if (this.last) {
				var i = this.lines.indexOf(this.last);
				if (i > -1) {
					this.lines.splice(i + 1, 0, line);
					this.last = line;
					return ref;
				}
			}

			this.lines.push(line);
			this.last = line;
			return ref;
		}
		return null;
	}

	remove(ref: string): string {
		ref = path.resolve(this.baseDir, ref);

		if (this.has(ref)) {
			var line = this.map[ref];

			var i = this.lines.indexOf(line);
			if (i > -1) {
				this.lines.splice(i, 1);
			}

			delete this.map[ref];

			if (line === this.last) {
				for (i -= 1; i >= 0; i--) {
					if (this.lines[i].ref) {
						this.last = this.lines[i];
						return ref;
					}
				}
			}
			this.last = null;
			return ref;
		}
		return null;
	}

	toArray(relative: boolean = false, canonical: boolean = false): string[] {
		var base = (relative ? path.dirname(this.target) : null);
		return Lazy(this.lines)
			.filter(line => !!line.ref)
			.map(line => line.getRef(base, canonical))
			.toArray();
	}

	stringify(): string {
		// make relative paths from target to files
		var base = path.dirname(this.target);
		return this.lines.map((line) => {
			return line.getValue(base) + this.eol;
		}).join('');
	}
}

// do not export, hide implementation
class BundleLine {

	value: string;
	ref: string;

	constructor(value: string, ref?: string) {
		this.value = value;
		this.ref = ref;
	}

	getRef(base?: string, canonical?: boolean): string {
		var ref = this.ref;
		if (base) {
			ref = path.relative(base, ref);
		}
		if (canonical && path.sep === '\\') {
			// TODO is this correct?
			ref = ref.replace(/\\/g, '/');
		}
		return ref;
	}

	getValue(base?: string): string {
		if (this.ref) {
			return '/// <reference path="' + this.getRef(base, true) + '" />';
		}
		return this.value;
	}
}

export = Bundle;
