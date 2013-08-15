///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../../xm/iterate.ts" />
///<reference path="../../xm/io/Logger.ts" />
///<reference path="../../xm/io/mkdirCheck.ts" />
///<reference path="PackageJSON.ts" />

module tsd {

	var fs = require('fs');
	var path = require('path');
	var assert = require('assert');

	export class Paths {

		tmp:string;
		typings:string;
		config:string;

		cache:string;

		constructor(public info:PackageJSON) {
			assert.ok(info, 'info');

			this.setTmp(Paths.findTmpDir(info));
			this.setCache(path.join(this.tmp, 'tsd_cache'));

			this.typings = xm.mkdirCheck(path.join(process.cwd(), 'typings'), true);
			this.config = path.join(process.cwd(), 'tsd-config.json');
		}

		setTmp(dir:string):string {
			this.tmp = xm.mkdirCheck(dir, true);
			return dir;
		}

		setCache(dir:string):string {
			this.cache = xm.mkdirCheck(dir, true);
			return dir;
		}

		static findTmpDir(info:PackageJSON):string {
			var now = Date.now();
			var candidateTmpDirs = [
				process.env['TMPDIR'] || '/tmp',
				info.pkg.tmp,
				path.join(process.cwd(), 'tmp')
			];

			for (var i = 0; i < candidateTmpDirs.length; i++) {
				var candidatePath = path.join(candidateTmpDirs[i], info.getKey());

				try {
					xm.mkdirCheck(candidatePath);
					return candidatePath;
				} catch (e) {
					console.log(candidatePath, 'is not writable:', e.message);
				}
			}
			throw (new Error('can not find a writable tmp directory.'));
		}
	}
}
