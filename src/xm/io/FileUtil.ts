/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../../_ref.d.ts" />

module xm {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var util = require('util');

	var Q:typeof Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var mkdirp = require('mkdirp');

	/*
	 FileUtil: do stuff with files
	 */
	export module FileUtil {

		function parseJson(text:string) {
			var json;
			try {
				json = JSON.parse(text);
			}
			catch (err) {
				if (err.name === 'SyntaxError') {
					xm.log.error(err);
					xm.log('---');
					xm.log(text);
					xm.log('---');
				}
				//rethrow
				throw(err);
			}
			return json;
		}

		function doReadJSONSync(src:string):any {
			return parseJson(fs.readFileSync(src, {encoding: 'utf8'}));
		}

		export function readJSONSync(src:string):any {
			var json;
			/*try {*/
			json = doReadJSONSync(src);
			/*}
			 catch (err) {
			 //retry.. weird glitch (windows)
			 json = doReadJSONSync(src);
			 }*/
			return json;
		}

		export function readJSON(src:string, callback:(err, res:any) => void) {
			fs.readFile(path.resolve(src), {encoding: 'utf8'}, (err, text) => {
				if (err || typeof text !== 'string') {
					return callback(err, null);
				}
				var json = null;
				try {
					json = parseJson(text);
				}
				catch (err) {
					return callback(err, null);
				}
				return callback(null, json);
			});
		}

		export function readJSONPromise(src:string):Q.Promise<any> {
			return <Q.Promise<any>> FS.read(src, {encoding: 'utf8'}).then((text:string) => {
				return parseJson(text);
			});
		}

		export function writeJSONSync(dest:string, data:any) {
			dest = path.resolve(dest);
			xm.FileUtil.mkdirCheckSync(path.dirname(dest));
			fs.writeFileSync(dest, JSON.stringify(data, null, 2), {encoding: 'utf8'});
		}

		export function writeJSONPromise(dest:string, data:any):Q.Promise<void> {
			var d:Q.Deferred<void> = Q.defer();

			dest = path.resolve(dest);
			xm.FileUtil.mkdirCheckQ(path.dirname(dest), true).then((dest:string) => {
				return FS.write(dest, JSON.stringify(data, null, 2), {encoding: 'utf8'});
			}).then(() => {
				d.resolve(null);
			}, d.reject);

			return d.promise;
		}

		//lazy wrapper as alternative to readJSONSync
		export function readFileSync(dest:string, encoding:string = 'utf8') {
			return fs.readFileSync(dest, {encoding: encoding});
		}

		//lazy wrapper as alternative to writeJSONSync
		export function writeFileSync(dest:string, data:any, encoding:string = 'utf8') {
			dest = path.resolve(dest);
			xm.FileUtil.mkdirCheckSync(path.dirname(dest));
			fs.writeFileSync(dest, data, {encoding: encoding});
		}

		/*
		 mkdirCheck: like mkdirp but with writable rights and verification, synchronous
		 */
		//TODO unit test this
		export function mkdirCheckSync(dir:string, writable:boolean = false, testWritable:boolean = false):string {
			dir = path.resolve(dir);
			if (fs.existsSync(dir)) {
				if (!fs.statSync(dir).isDirectory()) {
					throw (new Error('path exists but is not a directory: ' + dir));
				}
				if (writable) {
					fs.chmodSync(dir, '744');
				}
			}
			else {
				if (writable) {
					mkdirp.sync(dir, '744');
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
		//TODO why not by default make writable? why ever use this without writable?
		export function mkdirCheckQ(dir:string, writable:boolean = false, testWritable:boolean = false):Q.Promise<string> {
			dir = path.resolve(dir);

			var d:Q.Deferred<string> = Q.defer();

			FS.exists(dir).then((exists:boolean) => {
				if (exists) {
					return FS.isDirectory(dir).then((isDir:boolean) => {
						if (!isDir) {
							throw (new Error('path exists but is not a directory: ' + dir));
						}
						if (writable) {
							return FS.chmod(dir, '744');
						}
						return null;
					});
				}
				else {
					if (writable) {
						return Q.nfcall(mkdirp, dir, '744');
					}
					return Q.nfcall(mkdirp, dir);
				}
			}).then(() => {
				if (testWritable) {
					var testFile = path.join(dir, 'mkdirCheck_' + Math.round(Math.random() * Math.pow(10, 10)).toString(16) + '.tmp');

					return FS.write(testFile, 'test').then(() => {
						return FS.remove(testFile);
					}).catch((err) => {
						throw new Error('no write access to: ' + dir + ' -> ' + err);
					});
				}
			}).then(() => {
				d.resolve(dir);
			});
			return d.promise;
		}
	}
}
