///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../../xm/iterate.ts" />
///<reference path="../../xm/io/Logger.ts" />
///<reference path="../../xm/io/mkdirCheck.ts" />
///<reference path="PackageJSON.ts" />
///<reference path="Config.ts" />
///<reference path="Paths.ts" />

module tsd {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var assert = require('assert');
	var mkdirp = require('mkdirp');
	var tv4:TV4 = require('tv4').tv4;

	export class Context {

		packageInfo:PackageJSON;
		paths:Paths;
		config:Config;
		log:xm.Logger = xm.log;

		constructor(configPath:string = null, public verbose?:bool = false) {
			xm.assertVar('configPath', configPath, 'string', true);

			this.packageInfo = PackageJSON.getLocal();
			this.paths = new Paths(this.packageInfo);
			this.config = Config.getLocal(configPath || this.paths.config);

			this.paths.typings = xm.mkdirCheck(this.config.typingsPath, true);

			if (this.verbose) {
				this.logInfo(this.verbose);
			}
		}

		logInfo(details:bool = false):void {
			this.log(this.packageInfo.getNameVersion());
			this.log('repo: ' + this.config.repoURL + ' - #' + this.config.ref);
			if (details) {
				this.log.inspect(this.config, 'config');
				this.log.inspect(this.paths, 'paths');
			}
		}
	}
}
