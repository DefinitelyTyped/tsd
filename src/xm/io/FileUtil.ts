/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../../_ref.ts" />
///<reference path="../callAsync.ts" />

module xm {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');

	/*
	 FileUtil: do stuff with files
	 */
	// TODO refactor to functions (xm.fs)
	export class FileUtil {

		static readJSONSync(src:string):any {
			return JSON.parse(fs.readFileSync(src, 'utf8'));
		}

		static readJSON(src:string, callback:(err, res:any) => void) {
			fs.readFile(path.resolve(src), 'utf8', (err, file) => {
				if (err || !file) {
					return callback(err, null);
				}
				var json = null;
				try {
					json = JSON.parse(file);
				}
				catch (err) {
					return callback(err, null);
				}
				return callback(null, json);
			});
		}

		static writeJSONSync(src:string, data:any, callback:(err, res:any) => void) {
			fs.writeFileSync(path.resolve(src), JSON.stringify(data, null, 2), 'utf8');
		}

		static writeJSON(src:string, data:any, callback:(err) => void) {
			fs.writeFile(path.resolve(src), JSON.stringify(data, null, 2), 'utf8', callback);
		}
	}
}