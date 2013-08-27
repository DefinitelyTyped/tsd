/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

 module xm {

	 var mkdirp = require('mkdirp');
	 var path = require('path');
	 var fs = require('fs');

	// TODO proper chmod access
	export function mkdirCheck(dir:string, writable?:bool = false):string {
		dir = path.resolve(dir);
		if (fs.existsSync(dir)) {
			if (!fs.statSync(dir).isDirectory()) {
				throw (new Error('path exists but is not a directory: ' + dir));
			}
			if (writable) {
				fs.chmodSync(dir, '0664');
			}
		}
		else {
			if (writable) {
				mkdirp.sync(dir, '0664');
			}
			else {
				mkdirp.sync(dir);
			}
		}
		if (writable) {
			var testFile = path.join(dir, 'mkdirCheck_' + Date.now() + '.tmp');
			fs.writeFileSync(testFile, 'test');
			fs.unlinkSync(testFile);
		}
		return dir;
	}
}