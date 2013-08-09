///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../../xm/iterate.ts" />
///<reference path="../../xm/io/Logger.ts" />
///<reference path="PackageJSON.ts" />

module tsd {

	var fs = require('fs');
	var path = require('path');
	var assert = require('assert');
	var mkdirp = require('mkdirp');

	export class Paths {

		public tmp:string;
		public typings:string;
		public cache:string;
		public config:string;

		constructor(info:PackageJSON) {
			assert.ok(info, 'info');

			this.tmp = Paths.findTmpDir(info);
			this.cache = path.join(process.cwd(), 'tsd');
			mkdirp.sync(this.cache);

			this.typings = path.join(process.cwd(), 'typings');
			this.config = path.join(process.cwd(), 'tsd-config.json');
		}

		public setTypings(dir:string):void {
			if (fs.existsSync(dir)) {
				if (!fs.statSync(dir).isDirectory()) {
					throw (new Error('path exists but is not a directory: ' + dir));
				}
			}
			else {
				this.typings = dir;
				mkdirp.sync(dir);
			}
		}

		public static findTmpDir(info:PackageJSON):string {
			var now = Date.now();
			var candidateTmpDirs = [
				process.env['TMPDIR'] || '/tmp',
				info.pkg.tmp,
				path.join(process.cwd(), 'tmp')
			];

			for (var i = 0; i < candidateTmpDirs.length; i++) {
				var candidatePath = path.join(candidateTmpDirs[i], info.getKey());

				try {
					mkdirp.sync(candidatePath, '0777');
					var testFile = path.join(candidatePath, now + '.tmp');
					fs.writeFileSync(testFile, 'test');
					fs.unlinkSync(testFile);
					return candidatePath
				} catch (e) {
					console.log(candidatePath, 'is not writable:', e.message);
				}
			}
			throw (new Error('can not find a writable tmp directory.'));
		}
	}
}
