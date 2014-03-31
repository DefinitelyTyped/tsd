/// <reference path="../_ref.d.ts" />

'use strict';

import tv4 = require('tv4');
import AssertionError = require('assertion-error');

export function assert(value: any, schema: any): void {
	var res: TV4SingleResult = tv4.validateResult(value, schema);
	if (!res.valid) {
		throw res.error;
	}
	if (res.missing && res.missing.length > 0) {
		throw new AssertionError('validation error, missing schema: ' + res.missing);
	}
}
