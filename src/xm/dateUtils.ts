/// <reference path="./_ref.d.ts" />

'use strict';

import stringUtils = require('./stringUtils');
import typeOf = require('./typeOf');

export function getISOString(input: any): string {
	var date: Date;
	if (typeOf.isDate(input)) {
		date = input;
	}
	else if (typeOf.isString(input) || typeOf.isNumber(input)) {
		date = new Date(input);
	}
	return (date ? date.toISOString() : null);
}

// human friendly compact UTC time (maybe append 'UTC'?)
export function toNiceUTC(date: Date): string {
	return date.getUTCFullYear()
	+ '-' + stringUtils.padLeftZero(date.getUTCMonth() + 1)
	+ '-' + stringUtils.padLeftZero(date.getUTCDate())
	+ ' ' + stringUtils.padLeftZero(date.getUTCHours())
	+ ':' + stringUtils.padLeftZero(date.getUTCMinutes());
}

export function isBeforeDate(actual: Date, base: Date): boolean {
	return actual.getUTCFullYear() < base.getUTCFullYear()
	|| actual.getUTCMonth() < base.getUTCMonth()
	|| actual.getUTCDate() < base.getUTCDate();
}

export function isAfterDate(actual: Date, base: Date): boolean {
	return actual.getUTCFullYear() > base.getUTCFullYear()
	|| actual.getUTCMonth() > base.getUTCMonth()
	|| actual.getUTCDate() > base.getUTCDate();
}

export function isEqualDate(actual: Date, base: Date): boolean {
	return actual.toDateString() === base.toDateString();
}

// -n if date1 is smaller than date2, 0 if equal, +n if date2 is smaller than date1
export function compare(date1: Date, date2: Date): number {
	return date1.getTime() - date2.getTime();
}
