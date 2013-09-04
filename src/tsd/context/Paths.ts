///<reference path="../../xm/io/Logger.ts" />
///<reference path="../../xm/io/Logger.ts" />
///<reference path="../../_ref.ts" />
///<reference path="Const.ts" />

module tsd {

	var path = require('path');

	export class Paths {

		configFile:string;
		cacheDir:string;
		startCwd:string;

		constructor() {
			this.startCwd = path.resolve(process.cwd());
			this.configFile = path.resolve(this.startCwd, tsd.Const.configFile);
			this.cacheDir = path.resolve(this.startCwd, tsd.Const.cacheDir);
		}

		//TODO ditch this cargo-cult google-rip thing for proper version (and in Q-io)
		/*static findTmpDir(info:xm.PackageJSON):string {
			xm.assertVar('info', info, xm.PackageJSON);

			var now = Date.now();
			var candidateTmpDirs = [
				process.env['TMPDIR'],
				info.raw.tmp,
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
		}*/
	}
}
