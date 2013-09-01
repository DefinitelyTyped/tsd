///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../../xm/iterate.ts" />
///<reference path="../../xm/io/Logger.ts" />
///<reference path="../../xm/io/mkdirCheck.ts" />
///<reference path="../../xm/data/PackageJSON.ts" />

module tsd {

	var fs = require('fs');
	var os = require('os');
	var path = require('path');

	export class Paths {

		tmp:string;
		typings:string;
		config:string;

		cache:string;

		constructor(public info:xm.PackageJSON) {
			xm.assertVar('info', info, xm.PackageJSON);

			//TODO move creation to a method
			this.setTmp(Paths.findTmpDir(info));

			//TODO move to user profile similar to npm?
			this.setCache(path.join(this.tmp, 'cache'));

			this.typings = xm.mkdirCheckSync(path.resolve(process.cwd(), 'typings'), true);
			this.config = path.join(process.cwd(), 'tsd-config.json');
		}

		setTmp(dir:string):string {
			dir = xm.mkdirCheckSync(dir, true);
			this.tmp = dir;
			return this.tmp;
		}

		setCache(dir:string):string {
			dir = xm.mkdirCheckSync(dir, true);
			this.cache = dir;
			return dir;
		}

		static findTmpDir(info:xm.PackageJSON):string {
			xm.assertVar('info', info, xm.PackageJSON);

			var now = Date.now();
			var candidateTmpDirs = [
				process.env['TMPDIR'],
				info.pkg.tmp,
				os.tmpdir(),
				path.resolve(process.cwd(), 'tmp')
			];

			var key = info.getKey();

			for (var i = 0; i < candidateTmpDirs.length; i++) {
				if (!candidateTmpDirs[i]) {
					continue;
				}
				var candidatePath = path.resolve(candidateTmpDirs[i], key);

				try {
					xm.mkdirCheckSync(candidatePath);
					return candidatePath;
				} catch (e) {
					console.log(candidatePath, 'is not writable:', e.message);
				}
			}
			throw (new Error('can not find a writable tmp directory.'));
		}
	}
}
