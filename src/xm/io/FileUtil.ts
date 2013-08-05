///<reference path="../../_ref.ts" />

module xm {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');

	export class FileUtil {

		static readJSONSync(src:string):any {
			return JSON.parse(fs.readFileSync(src, 'utf8'));
		}

		static readJSON(src:string, callback:(err, res:any) => void) {
			fs.readFile(path.resolve(src), 'utf8', (err, file) => {
				if (err || !file) return callback(err, null);
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
			var str;
			try {
				str = JSON.stringify(data, null, 4);
			}
			catch (err) {
				return callback(err, null)
			}
			fs.writeFileSync(path.resolve(src), str, 'utf8');
		}

		static writeJSON(src:string, data:any, callback:(err, res:any) => void) {
			var str;
			try {
				str = JSON.stringify(data, null, 4);
			}
			catch (err) {
				return callback(err, null)
			}
			fs.writeFile(path.resolve(src), str, 'utf8', callback);
		}
	}
}