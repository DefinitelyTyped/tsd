/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

 module xm {
	 //setImmediate helper
	export function callAsync(callback, ...args:any[]) {
		process.nextTick(() => {
			callback.apply(null, args);
		});
	}
}