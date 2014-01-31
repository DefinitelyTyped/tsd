/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

module xm {
	'use strict';

	export function enumNames(enumer:Object):string[] {
		return Object.keys(enumer).filter((value:string) => {
			return !/\d+/.test(value);
		});
	}
}
