///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../../xm/iterate.ts" />
///<reference path="../../xm/Logger.ts" />
///<reference path="../../xm/data/PackageJSON.ts" />
///<reference path="Config.ts" />
///<reference path="Paths.ts" />
///<reference path="Const.ts" />

module tsd {
	'use strict';

	var path = require('path');

	/*
	 Context: bundles the configuration and core functionality
	 */
	export class Context {

		paths:Paths;
		config:Config;
		packageInfo:xm.PackageJSON;

		//TODO use more of this log? (xm.log is pretty global already)
		log:xm.Logger = xm.getLogger('Context');

		constructor(public configFile:string = null, public verbose:boolean = false) {
			xm.assertVar(configFile, 'string', 'configFile', true);

			this.packageInfo = xm.PackageJSON.getLocal();

			this.paths = new Paths();
			if (configFile) {
				this.paths.configFile = path.resolve(configFile);
			}
			var schema = xm.FileUtil.readJSONSync(path.resolve(path.dirname(xm.PackageJSON.find()), 'schema', tsd.Const.configSchemaFile));

			this.config = new Config(schema);
		}

		logInfo(details:boolean = false):void {
			this.log(this.packageInfo.getNameVersion());
			this.log('repo: ' + this.config.repo + ' #' + this.config.ref);
			if (details) {
				this.log('paths', this.paths);
				this.log('config', this.config);
				this.log('resolved typings', this.config.resolveTypingsPath(path.dirname(this.paths.configFile)));
				this.log('installed', this.config.getInstalled());
			}
		}
	}
}

