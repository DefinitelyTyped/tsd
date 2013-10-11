/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../../_ref.d.ts" />
///<reference path="mkdirCheck.ts" />

module xm {
	'use strict';

	var fs = require('fs');
	var Q:typeof Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');
	var path = require('path');
	var util = require('util');

	/*
	 FileUtil: do stuff with files
	 */
	// TODO refactor to functions (xm.fs)
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

		export function readJSONSync(src:string):any {
			return parseJson(fs.readFileSync(src, {encoding: 'utf8'}));
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
			xm.mkdirCheckSync(path.dirname(dest));
			fs.writeFileSync(dest, JSON.stringify(data, null, 2), {encoding: 'utf8'});
		}

		export function writeJSONPromise(dest:string, data:any):Q.Promise<void> {
			var d:Q.Deferred<void> = Q.defer();

			dest = path.resolve(dest);
			xm.mkdirCheckQ(path.dirname(dest), true).then((dest:string) => {
				return FS.write(dest, JSON.stringify(data, null, 2), {encoding: 'utf8'});
			}).then(() => {
				d.resolve(null);
			}, d.reject);

			return d.promise;
		}
	}
}
