/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

module xm {
	//TODO move to FileUtil
	var Q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');
	var mkdirp = require('mkdirp');
	var path = require('path');
	var fs = require('fs');
	/*
	 mkdirCheck: like mkdirp but with writable rights and verification, synchronous
	 */
	//TODO unit test this
	export function mkdirCheckSync(dir:string, writable?:bool = false, testWritable?:bool = false):string {
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
		if (testWritable) {
			var testFile = path.join(dir, 'mkdirCheck_' + Math.round(Math.random() * Math.pow(10, 10)).toString(16) + '.tmp');
			try {
				fs.writeFileSync(testFile, 'test');
				fs.unlinkSync(testFile);
			}
			catch (e) {
				//rethrow
				throw new Error('no write access to: ' + dir + ' -> ' + e);
			}
		}
		return dir;
	}

	/*
	 mkdirCheckQ: like mkdirp but with writable rights and verification, returns a promise
	 */
	//TODO unit test this
	export function mkdirCheckQ(dir:string, writable?:bool = false, testWritable?:bool = false):Qpromise {
		dir = path.resolve(dir);

		return FS.exists(dir).then((exists:bool) => {
			if(exists) {
				return FS.isDirectory(dir).then((isDir:bool) => {
					if(!isDir) {
						throw (new Error('path exists but is not a directory: ' + dir));
					}
					if (writable) {
						return FS.chmod(dir, '744');
					}
					return null;
				});
			}
			if (writable) {
				return Q.nfcall(mkdirp, dir, '744');
			}
			return Q.nfcall(mkdirp, dir);
		}).then(() => {
			if (testWritable) {
				var testFile = path.join(dir, 'mkdirCheck_' + Math.round(Math.random() * Math.pow(10, 10)).toString(16) + '.tmp');

				return FS.write(testFile, 'test').then(() => {
					return FS.remove(testFile);
				}).catch((err) => {
					throw new Error('no write access to: ' + dir + ' -> ' + err);
				});
			}
			return null;
		}).thenResolve(dir);
	}
}