///<reference path="../../../globals.ts" />
///<reference path="../../../../src/tsd/data/DefInfoParser.ts" />

module helper {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var async:Async = require('async');

	export class HeaderAssert {
		fields:any;
		header:any;
		key:string;

		constructor(public project:string, public name:string) {
			this.key = this.project + '/' + this.name;
		}
	}

	//old tsd-deftools fixture loader

	//TODO when bored: rewrite using promises (not important)
	export function loadHeaderFixtures(src:string, finish:(err, res:HeaderAssert[]) => void) {
		src = path.resolve(src);

		if (!fs.existsSync(src)) {
			return finish(new Error('missing path: ' + src), []);
		}
		if (!fs.statSync(src).isDirectory()) {
			return finish(new Error('not directory: ' + src), []);
		}

		//loop projects
		fs.readdir(src, (err, files:string[]) => {
			if (err || !files) {
				return finish(err, []);
			}

			async.reduce(files, [], (memo:helper.HeaderAssert[], project, callback:(err, res?) => void) => {
				var dir = path.join(src, project);

				fs.stat(dir, (err, stats) => {
					if (err || !stats) {
						return callback(err);
					}
					if (!stats.isDirectory()) {
						return callback(null, memo);
					}

					//loop sub modules
					fs.readdir(dir, (err, files:string[]) => {

						async.reduce(files, memo, (memo:helper.HeaderAssert[], name, callback:(err, res?) => void) => {
							var pack = path.join(dir, name);

							fs.stat(dir, (err, stats) => {
								if (err || !stats) {
									return callback(err);
								}
								if (!stats.isDirectory()) {
									return callback(null, memo);
								}

								//grab data files
								async.parallel({
									header: (callback) => {
										fs.readFile(path.join(pack, 'header.ts'), 'utf8', callback);
									},
									fields: (callback) => {
										xm.FileUtil.readJSON(path.join(pack, 'fields.json'), callback);
									}
								}, (err, res:any) => {
									if (err) {
										return callback(err);
									}

									//needed?
									if (!res.fields) {
										return callback(new Error('missing res.fields'));
									}
									if (!res.header) {
										return callback(new Error('missing res.header'));
									}

									var data = new helper.HeaderAssert(project, name);
									data.fields = res.fields;
									data.header = res.header;
									memo.push(data);

									callback(null, memo);
								});
							});

						}, (err, memo) => {
							callback(err, memo || []);
						});
					});
				});

			}, (err, memo) => {
				(<Function> finish)(err, memo || []);
			});
		});
	}
}