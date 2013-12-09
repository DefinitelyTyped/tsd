///<reference path="../../../globals.ts" />
///<reference path="../../../../src/tsd/data/DefInfoParser.ts" />
///<reference path="../../../../typings/node/node.d.ts" />

module helper {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');

	var Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');

	export class HeaderAssert {
		fields:any;
		header:any;
		key:string;

		constructor(public project:string, public name:string) {
			this.key = this.project + '/' + this.name;
		}
	}

	//hacky ported from old tsd-deftools fixture loader

	//TODO when bored: rewrite using promises (not important)
	export function loadHeaderFixtures(src:string):Q.Promise<helper.HeaderAssert[]> {
		src = path.resolve(src);

		var d:Q.Deferred<helper.HeaderAssert[]> = Q.defer();
		var res:helper.HeaderAssert[] = [];

		getDirs(src).then((dirs:string[]) => {
			return Q.all(dirs.reduce((memo:any[], project:string) => {
				memo.push(getDirs(path.join(src, project)).then((names:string[]) => {

					return Q.all(names.reduce((memo:any[], name:string) => {
						var pack = path.join(src, project, name);
						memo.push(Q.all([
							xm.FileUtil.readJSONPromise(path.join(pack, 'fields.json')),
							FS.read(path.join(pack, 'header.ts'))
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

	function getDirs(src:string):Q.Promise<string[]> {
		src = path.resolve(src);
		var ret:string[] = [];
		var d:Q.Deferred<string[]> = Q.defer();
		FS.list(src).then((names:string[]) => {
			return Q.all(names.map((name:string) => {
				return FS.isDirectory(path.join(src, name)).then((isDir:boolean) => {
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