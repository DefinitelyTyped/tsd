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
	 ISet: yer basic set interface
	 */
	export interface ISet {
		has (value:any):boolean;
		add (value:any):void;
		remove (value:any):void;
		values ():any[];
		import (values:string[]):void;
		clear ():void;
		count ():number;
	}
	/*
	 Set: yer basic set: unordered but unique values
	 */
	export class Set implements ISet {

		private _content:any[] = [];

		constructor(values?:any[]) {
			if (values) {
				this.import(values);
			}
		}

		has(value:any):boolean {
			return this._content.indexOf(value) > -1;
		}

		add(value:any):void {
			if (this._content.indexOf(value) < 0) {
				this._content.push(value);
			}
		}

		remove(value:any):void {
			var i = this._content.indexOf(value);
			if (i > -1) {
				this._content.splice(i, 1);
			}
		}

		values():any[] {
			return this._content.slice(0);
		}

		import(values:any[]):void {
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
