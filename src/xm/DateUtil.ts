module xm {
	'use strict';

	function pad(number) {
		var r = String(number);
		if (r.length === 1) {
			r = '0' + r;
		}
		return r;
	}

	/*
	 DateUtil: do stuff with dates
	 */
	export module DateUtil {

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
