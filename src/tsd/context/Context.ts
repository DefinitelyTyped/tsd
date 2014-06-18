/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');

import assertVar = require('../../xm/assertVar');
import fileIO = require('../../xm/fileIO');
import JSONPointer = require('../../xm/lib/JSONPointer');
import PackageJSON = require('../../xm/lib/PackageJSON');

import Config = require('./Config');
import Paths = require('./Paths');
import Const = require('./Const');

/*
 Context: bundles the configuration and core functionality
 */
class Context {

	verbose: boolean;

	paths: Paths;
	config: Config;
	packageInfo: PackageJSON;
	settings: JSONPointer;

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

		this.config = new Config();
	}

	stackSettings(src: string): void {
		if (fs.existsSync(src)) {
			if (this.verbose) {
				console.log('using rc: ' + src);
			}
			this.settings.addSource(fileIO.readJSONSync(src));
		}
		else {
			if (this.verbose) {
				console.log('cannot find rc: ' + src);
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
			repo: 'https://github.com/' + this.config.repo + ' #' + this.config.ref
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
