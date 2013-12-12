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

	require('date-utils');

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
		export function toNiceUTC(date:Date) {
			return date.getUTCFullYear()
			+ '-' + pad(date.getUTCMonth() + 1)
			+ '-' + pad(date.getUTCDate())
			+ ' ' + pad(date.getUTCHours())
			+ ':' + pad(date.getUTCMinutes());
		}
	}
}
