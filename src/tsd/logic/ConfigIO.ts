/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import pointer = require('json-pointer');
import Promise = require('bluebird');
import VError = require('verror');

import fileIO = require('../../xm/fileIO');

import Options = require('../Options');
import Core = require('./Core');
import CoreModule = require('./CoreModule');

class ConfigIO extends CoreModule {

	constructor(core: Core) {
		super(core, 'ConfigIO');
	}

	/*
	 load the current configFile, optional to not throw error on missing file
	 */
	initConfig(overwrite: boolean): Promise<string> {
		var target = this.core.context.paths.configFile;

		return fileIO.exists(target).then((exists: boolean) => {
			if (exists) {
				if (!overwrite) {
					throw new VError('cannot overwrite file %s', target);
				}
				return fileIO.remove(target);
			}
			return;
		}).then(() => {
			this.core.context.config.reset();
			return this.saveConfig();
		}).return(target);
	}

	/*
	 load the current configFile, optional to not throw error on missing file
	 */
	readConfig(optional: boolean = false): Promise<void> {
		var target = this.core.context.paths.configFile;

		return fileIO.exists(target).then((exists: boolean) => {
			if (!exists) {
				if (!optional) {
					throw new VError('cannot locate file %s', target);
				}
				return;
			}
			return fileIO.read(target, {flags: 'r'}).then((json: string) => {
				this.core.context.config.parseJSONString(String(json), target);
				this.core.updateConfig();
			});
		}).return();
	}

	/*
	 save current config to json
	 */
	saveConfig(target?: string): Promise<string> {
		target = target || this.core.context.paths.configFile;
		var output = this.core.context.config.toJSONString();
		return fileIO.write(target, output).return(target);
	}
}

export = ConfigIO;
