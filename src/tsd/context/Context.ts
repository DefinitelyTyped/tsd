///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../../xm/iterate.ts" />
///<reference path="../../xm/io/Logger.ts" />
///<reference path="../../xm/io/mkdirCheck.ts" />
///<reference path="../../xm/data/PackageJSON.ts" />
///<reference path="Config.ts" />
///<reference path="Paths.ts" />

module tsd {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var assert = require('assert');
	var mkdirp = require('mkdirp');
	var Q = require('Q');
	var tv4:TV4 = require('tv4').tv4;

	export class Context {

		packageInfo:xm.PackageJSON;
		paths:Paths;
		config:Config;
		log:xm.Logger = xm.log;

		constructor(configPath:string = null, public verbose?:bool = false) {
			xm.assertVar('configPath', configPath, 'string', true);

			this.packageInfo = xm.PackageJSON.getLocal();
			this.paths = new Paths(this.packageInfo);

			var schema = xm.FileUtil.readJSONSync(path.resolve(path.dirname(this.packageInfo.path), 'schema', 'tsd-config_v4.json'));
			this.config = Config.getLocal(schema, configPath || this.paths.config);

			this.paths.typings = xm.mkdirCheck(this.config.typingsPath, true);

			Q.longStackSupport = true;

			if (this.verbose) {
				this.logInfo(true);
			}
		}

		logInfo(details:bool = false):void {
			this.log(this.packageInfo.getNameVersion());
			this.log('repo: ' + this.config.repo + ' - #' + this.config.ref);
			if (details) {
				this.log.inspect(this.config, 'config');
				this.log.inspect(this.paths, 'paths');
			}
		}
	}
}
