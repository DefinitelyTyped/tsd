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
	var Q:QStatic = require('Q');
	var tv4:TV4 = require('tv4').tv4;

	//TODO mode this into more central spot, always-run?
	require('source-map-support').install();
	process.setMaxListeners(20);

	export class Context {

		paths:Paths;
		config:Config;
		packageInfo:xm.PackageJSON;
		log:xm.Logger = xm.log;

		constructor(configPath:string = null, public verbose?:bool = false) {
			xm.assertVar('configPath', configPath, 'string', true);

			//TODO should not auto-create folders (add method).
			//TODO also promisify (for virtual filesystem: )

			this.packageInfo = xm.PackageJSON.getLocal();
			this.paths = new Paths(this.packageInfo);

			var schema = xm.FileUtil.readJSONSync(path.resolve(path.dirname(this.packageInfo.path), 'schema', 'tsd-config_v4.json'));
			this.config = Config.getLocal(schema, configPath || this.paths.config);

			this.paths.typings = xm.mkdirCheckSync(this.config.typingsPath, true);

			//sweet stacks
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
