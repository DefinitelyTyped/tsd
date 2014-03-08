/// <reference path="../../xm/file.ts" />
/// <reference path="../../xm/iterate.ts" />
/// <reference path="../../xm/Logger.ts" />
/// <reference path="../../xm/data/PackageJSON.ts" />
/// <reference path="../../xm/json-pointer.ts" />
/// <reference path="Config.ts" />
/// <reference path="Paths.ts" />
/// <reference path="Const.ts" />

module tsd {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	/*
	 Context: bundles the configuration and core functionality
	 */
	export class Context {

		paths:Paths;
		config:Config;
		packageInfo:xm.PackageJSON;
		verbose:boolean;
		settings:xm.JSONPointer;

		// TODO remove or use more of this log? (xm.log is pretty global already)
		// log:xm.Logger = xm.getLogger('Context');
		configSchema:any;

		// TODO extract IO
		constructor(configFile:string = null, verbose:boolean = false) {
			xm.assertVar(configFile, 'string', 'configFile', true);
			xm.assertVar(verbose, 'boolean', 'verbose');

			this.packageInfo = xm.PackageJSON.getLocal();
			this.settings = new xm.JSONPointer(xm.file.readJSONSync(path.resolve(path.dirname(xm.PackageJSON.find()), 'conf', 'settings.json')));

			this.stackSettings(path.resolve(tsd.Paths.getUserHome(), tsd.Const.rc));
			this.stackSettings(path.resolve(process.cwd(), tsd.Const.rc));

			this.verbose = verbose;

			this.paths = new Paths();
			if (configFile) {
				this.paths.configFile = path.resolve(configFile);
			}
			this.paths.cacheDir = tsd.Paths.getUserCacheDir();

			this.configSchema = xm.file.readJSONSync(path.resolve(path.dirname(xm.PackageJSON.find()), 'schema', tsd.Const.configSchemaFile));
			this.config = new Config(this.configSchema);
		}

		stackSettings(src:string):void {
			if (fs.existsSync(src)) {
				if (this.verbose) {
					xm.log.status('using rc: ' + src);
				}
				this.settings.addSource(xm.file.readJSONSync(src));
			}
			else {
				if (this.verbose) {
					xm.log.status('cannot find rc: ' + src);
				}
			}
		}

		getTypingsDir():string {
			return this.config.resolveTypingsPath(path.dirname(this.paths.configFile));
		}

		// TODO move this out of this class
		getInfo(details:boolean = false):Object {
			var info:any = {
				version: this.packageInfo.getNameVersion(),
				repo: 'http://github.com/' + this.config.repo + ' #' + this.config.ref
			};
			if (details) {
				info.paths = this.paths;
				info.typings = this.config.resolveTypingsPath(path.dirname(this.paths.configFile));
				info.config = this.config.toJSON();
			}
			return info;
		}
	}
}

