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
		verbose:boolean;

		//TODO remove or use more of this log? (xm.log is pretty global already)
		log:xm.Logger = xm.getLogger('Context');
		configSchema:any;

		constructor(configFile:string = null, verbose:boolean = false) {
			xm.assertVar(configFile, 'string', 'configFile', true);
			xm.assertVar(verbose, 'boolean', 'verbose');

			this.packageInfo = xm.PackageJSON.getLocal();
			this.verbose = verbose;

			this.paths = new Paths();
			if (configFile) {
				this.paths.configFile = path.resolve(configFile);
			}
			this.configSchema = xm.FileUtil.readJSONSync(path.resolve(path.dirname(xm.PackageJSON.find()), 'schema', tsd.Const.configSchemaFile));
			this.config = new Config(this.configSchema);
		}

		getTypingsDir():string {
			return this.config.resolveTypingsPath(path.dirname(this.paths.configFile));
		}

		//TODO move this out of this class
		logInfo(details:boolean = false):void {
			this.log(this.packageInfo.getNameVersion());
			this.log('repo: ' + this.config.repo + ' #' + this.config.ref);
			if (details) {
				this.log('paths: ' + JSON.stringify(this.paths, null, 3));
				this.log('config: ' + JSON.stringify(this.config, null, 3));
				this.log('resolved typings: ' + JSON.stringify(this.config.resolveTypingsPath(path.dirname(this.paths.configFile)), null, 3));
				this.log('installed: ' + JSON.stringify(this.config.getInstalled(), null, 3));
			}
		}
	}
}

