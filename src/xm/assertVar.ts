/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

 module xm {
	export function assertVar(label:string, value:any, type:any, opt?:bool = false):void {
		var valueType = typeof value;
		var typeKind = typeof type;

		// undefined or null
		if (!value && (valueType === 'undefined' || valueType === 'object')) {
			if (!opt) {
				throw (new Error('expected "' + label + '" to be defined but got "' + value + '"'));
			}
		}
		else if (typeKind === 'function') {
			if (value.constructor instanceof type) {
				throw (new Error('expected "' + label + '" to be instanceof "' + type + '" but got "' + value.constructor + '": ' + value));
			}
		}
		else if (typeKind === 'string') {
			if (valueType !== type) {
				throw (new Error('expected "' + label + '" expected typeof "' + type + '" but got "' + valueType + '": ' + value));
			}
		}
		else {
			throw (new Error('bad type assertion parameter "' + type + '" for "' + label + '"'));
		}
	}
}
