/// <reference path="../../_ref.d.ts" />

module tsd {
	'use strict';

	var path = require('path');
	var splitExp = /(?:(.*)(\r?\n))|(?:(.+)($))/g;

	// TODO replace reference node RegExp with a xml parser (tony the pony)
	var referenceTagExp = /\/\/\/[ \t]+<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

	/*
	 Bundle - file to bundle <reference/> 's

	 complicated from trying to keep file structure mostly intact after manipulating the file

	 with auto-eol detector
	 */
	// TODO optimise text content (keep as block)
	export class Bundle {

		private head:BundleLine;
		private eol:string;

		constructor(public target:string) {
			this.target = target.replace(/^\.\//, '');
		}

		parse(content:string):void {
			this.head = null;
			this.eol = '\n';

			var lineMatch:RegExpExecArray;
			var refMatch:RegExpExecArray;
			var line:BundleLine;
			var prev:BundleLine = null;

			var eolWin = 0;
			var eolNix = 0;

			splitExp.lastIndex = 0;
			while ((lineMatch = splitExp.exec(content))) {
				splitExp.lastIndex = lineMatch.index + lineMatch[0].length;

				line = new BundleLine(lineMatch[1]);
				if (prev) {
					line.prev = prev;
					prev.next = line;
				}
				prev = line;
				if (!this.head) {
					this.head = line;
				}

				if (/\r\n/.test(lineMatch[2])) {
					eolWin++;
				}
				else {
					eolNix++;
				}

				referenceTagExp.lastIndex = 0;
				refMatch = referenceTagExp.exec(lineMatch[1]);
				if (refMatch && refMatch.length > 1) {
					line.ref = refMatch[1];
				}
			}

			// auto detect
			this.eol = (eolWin > eolNix ? '\r\n' : '\n');
		}

		has(ref:string):boolean {
			var line = this.head;
			while (line) {
				if (line.ref === ref) {
					return true;
				}
				line = line.next;
			}
			return false;
		}

		append(ref:string):void {
			if (!this.has(ref)) {
				var line = new BundleLine('', ref);
				if (this.head) {
					var last = this.last();
					if (last) {
						last.addAfter(line);
					}
					else {
						// first ref, add on top
						this.head.prev = line;
						line.next = this.head;
						this.head = line;
					}
				}
				else {
					this.head = line;
				}
			}
		}

		remove(ref:string):void {
			var line = this.head;
			while (line) {
				if (line.ref === ref) {
					if (line === this.head) {
						this.head = line.next;
					}
					line.removeSelf();
					return;
				}
				line = line.next;
			}
		}

		toArray(all:boolean = false):string[] {
			var line = this.head;
			var ret:string[] = [];
			while (line) {
				if (all || line.ref) {
					ret.push(line.ref);
				}
				line = line.next;
			}
			return ret;
		}

		private first(all:boolean = false):BundleLine {
			var line = this.head;
			while (line) {
				if (all || line.ref) {
					return line;
				}
				line = line.next;
			}
			return null;
		}

		private last(all:boolean = false):BundleLine {
			var line = this.head;
			var ret:BundleLine = null;
			while (line) {
				if (all || line.ref) {
					ret = line;
				}
				line = line.next;
			}
			return ret;
		}

		getContent():string {
			var content:string[] = [];

			var line = this.head;
			while (line) {
				content.push(line.getValue(), this.eol);
				line = line.next;
			}
			return content.join('');
		}
	}

	// do not export, hide implementation
	class BundleLine {

		next:BundleLine;
		prev:BundleLine;

		constructor(public value:string, public ref?:string) {

		}

		getValue():string {
			if (this.ref) {
				return '/// <reference path="' + this.ref + '" />';
			}
			return this.value;
		}

		addAfter(add:BundleLine):void {
			add.prev = this;
			add.next = this.next;
			if (this.next) {
				this.next.prev = add;
			}
			this.next = add;
		}

		removeSelf():void {
			if (this.prev) {
				this.prev.next = this.next;
			}
			if (this.next) {
				this.next.prev = this.prev;
			}
			this.next = null;
			this.prev = null;
		}
	}
}
