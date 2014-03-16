/// <reference path="../../../globals.ts" />
/// <reference path="../../../../src/tsd/support/DefInfoParser.ts" />
/// <reference path="../../../../typings/node/node.d.ts" />

module helper {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');

	var Q = require('q');

	export class HeaderAssert {
		fields:any;
		header:any;
		key:string;

		constructor(public project:string, public name:string) {
			this.key = this.project + '/' + this.name;
		}
	}

	// hacky ported from old tsd-deftools fixture loader

	// TODO when bored: rewrite using promises (not important)
	export function loadHeaderFixtures(src:string):Promise<helper.HeaderAssert[]> {
		src = path.resolve(src);

		var d = Promise.defer<helper.HeaderAssert[]>();
		var res:helper.HeaderAssert[] = [];

		getDirs(src).then((dirs:string[]) => {
			return Promise.all(dirs.reduce((memo:any[], project:string) => {
				memo.push(getDirs(path.join(src, project)).then((names:string[]) => {

					return Promise.all(names.reduce((memo:any[], name:string) => {
						var pack = path.join(src, project, name);
						memo.push(Promise.all([
							xm.file.readJSONPromise(path.join(pack, 'fields.json')),
							xm.file.read(path.join(pack, 'header.ts'))
						]).spread((fields, header) => {
							var data = new helper.HeaderAssert(project, name);
							data.fields = fields;
							data.header = header;
							res.push(data);
						}));
						return memo;
					}, []));
				}));
				return memo;
			}, []));
		}).done(() => {
			d.resolve(res);
		}, d.reject);

		return d.promise;
	}

	function getDirs(src:string):Promise<string[]> {
		src = path.resolve(src);
		var ret:string[] = [];
		var d = Promise.defer<string[]>();
		xm.file.list(src).then((names:string[]) => {
			return Promise.all(names.map((name:string) => {
				return xm.file.isDirectory(path.join(src, name)).then((isDir:boolean) => {
					if (!isDir) {
						return;
					}
					ret.push(name);
				});
			}));
		}).then(() => {
			d.resolve(ret);
		}, d.reject);
		return d.promise;
	}
}
