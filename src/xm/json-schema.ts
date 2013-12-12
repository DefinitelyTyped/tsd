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

	var tv4:TV4 = require('tv4');

	export function assertJSONSchema(value:any, schema:any):void {
		var res:TV4SingleResult = tv4.validateResult(value, schema);
		if (!res.valid || res.missing.length > 0) {
			throw res.error;
		}
	}
}
