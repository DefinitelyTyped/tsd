/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

module xm {
	'use strict';

	/*
	 ISet: basic set interface
	 */
	export interface ISet<T> {
		has (value:T):boolean;
		add (value:T):void;
		remove (value:T):void;
		values ():T[];
		import (values:T[]):void;
		clear ():void;
		count ():number;
	}
	/*
	 Set: yer basic set: unordered but unique values
	 */
	//TODO ditch for ES6 Set's
	export class Set<T> implements ISet<T> {

		private _content:T[] = [];

		constructor(values?:any[]) {
			if (values) {
				this.import(values);
			}
		}

		has(value:T):boolean {
			return this._content.indexOf(value) > -1;
		}

		add(value:T):void {
			if (this._content.indexOf(value) < 0) {
				this._content.push(value);
			}
		}

		remove(value:T):void {
			var i = this._content.indexOf(value);
			if (i > -1) {
				this._content.splice(i, 1);
			}
		}

		values():T[] {
			return this._content.slice(0);
		}

		import(values:T[]):void {
			for (var i = 0, ii = values.length; i < ii; i++) {
				this.add(values[i]);
			}
		}

		clear():void {
			this._content = [];
		}

		count():number {
			return this._content.length;
		}
	}
}
