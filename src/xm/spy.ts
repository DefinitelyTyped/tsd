/// <reference path="Logger.ts" />

module xm {
	'use strict';

	export function spyAll(object:any):void {
		/*tslint:disable:forin */

		for (var prop in object) {
			spy(object, prop);
		}
	}

	export function spy(object:any, prop:string):void {
		var value:any = object[prop];
		if (typeof value === 'function') {
			object[prop] = function () {
				var result = value.apply(object, arguments);
				xm.log.status(prop, Array.prototype.slice.call(arguments, 0), result);
				return result;
			};
		}
	}
}
