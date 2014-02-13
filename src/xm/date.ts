/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="typeOf.ts" />

module xm {
	'use strict';

	function pad(input:number):string {
		var r = String(input);
		if (r.length === 1) {
			r = '0' + r;
		}
		return r;
	}

	/*
	 date: do stuff with dates
	 */
	export module date {

		export function getISOString(input:any):string {
			var date:Date;
			if (xm.isDate(input)) {
				date = input;
			}
			else if (xm.isString(input) || xm.isNumber(input)) {
				date = new Date(input);
			}
			return (date ? date.toISOString() : null);
		}

		// human friendly compact UTC time (maybe append 'UTC'?)
		export function toNiceUTC(date:Date):string {
			return date.getUTCFullYear()
				+ '-' + pad(date.getUTCMonth() + 1)
				+ '-' + pad(date.getUTCDate())
				+ ' ' + pad(date.getUTCHours())
				+ ':' + pad(date.getUTCMinutes());
		}

		export function isBeforeDate(actual:Date, base:Date):boolean {
			return actual.getUTCFullYear() < base.getUTCFullYear()
				|| actual.getUTCMonth() < base.getUTCMonth()
				|| actual.getUTCDate() < base.getUTCDate();
		}

		export function isAfterDate(actual:Date, base:Date):boolean {
			return actual.getUTCFullYear() > base.getUTCFullYear()
				|| actual.getUTCMonth() > base.getUTCMonth()
				|| actual.getUTCDate() > base.getUTCDate();
		}

		export function isEqualDate(actual:Date, base:Date):boolean {
			return actual.toDateString() === base.toDateString();
		}

		// -n if date1 is smaller than date2, 0 if equal, +n if date2 is smaller than date1
		export function compare(date1:Date, date2:Date):number {
			return date1.getTime() - date2.getTime();
		}
	}
}
