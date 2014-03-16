/// <reference path="../_ref.d.ts" />

import fs = require('fs');
import path = require('path');

import log = require('../../xm/log');
import assertVar = require('../../xm/assertVar');
import fileIO = require('../../xm/file/fileIO');
import JSONPointer = require('../../xm/json/JSONPointer');
import PackageJSON = require('../../xm/data/PackageJSON');

import Config = require('./Config');
import Paths = require('./Paths');
import Const = require('./Const');

/*
 Context: bundles the configuration and core functionality
 */
class Context {

	paths: Paths;
	config: Config;
	packageInfo: PackageJSON;
	verbose: boolean;
	settings: JSONPointer;

	// TODO remove or use more of this log? (log is pretty global already)
	// log:Logger = getLogger('Context');
	configSchema: any;

	// TODO extract IO
	constructor(configFile: string = null, verbose: boolean = false) {
		assertVar(configFile, 'string', 'configFile', true);
		assertVar(verbose, 'boolean', 'verbose');

		this.packageInfo = PackageJSON.getLocal();
		this.settings = new JSONPointer(fileIO.readJSONSync(path.resolve(path.dirname(PackageJSON.find()), 'conf', 'settings.json')));

		this.stackSettings(path.resolve(Paths.getUserHome(), Const.rc));
		this.stackSettings(path.resolve(process.cwd(), Const.rc));

		this.verbose = verbose;

		this.paths = new Paths();
		if (configFile) {
			this.paths.configFile = path.resolve(configFile);
		}
		this.paths.cacheDir = Paths.getUserCacheDir();

		this.configSchema = fileIO.readJSONSync(path.resolve(path.dirname(PackageJSON.find()), 'schema', Const.configSchemaFile));
		this.config = new Config(this.configSchema);
	}

	stackSettings(src: string): void {
		if (fs.existsSync(src)) {
			if (this.verbose) {
				log.status('using rc: ' + src);
			}
			this.settings.addSource(fileIO.readJSONSync(src));
		}
		else {
			if (this.verbose) {
				log.status('cannot find rc: ' + src);
			}
		}
	}

	getTypingsDir(): string {
		return this.config.resolveTypingsPath(path.dirname(this.paths.configFile));
	}

	// TODO move this out of this class
	getInfo(details: boolean = false): Object {
		var info: any = {
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

export = Context;
