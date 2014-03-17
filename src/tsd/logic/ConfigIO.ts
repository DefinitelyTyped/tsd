/// <reference path="../_ref.d.ts" />

import fs = require('graceful-fs');
import path = require('path');
import pointer = require('json-pointer');
import Promise = require('bluebird');

import fileIO = require('../../xm/file/fileIO');

import Options = require('../Options');
import Core = require('Core');
import SubCore = require('./SubCore');

class ConfigIO extends SubCore {

	static config_init = 'config_init';
	static config_read = 'config_read';
	static config_save = 'config_save';

	constructor(core: Core) {
		super(core, 'config', 'ConfigIO');
	}

	/*
	 load the current configFile, optional to not throw error on missing file
	 */
	initConfig(overwrite: boolean): Promise<string> {
		var target = this.core.context.paths.configFile;

		return fileIO.exists(target).then((exists: boolean) => {
			if (exists) {
				if (!overwrite) {
					throw new Error('cannot overwrite file: ' + target);
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
					throw new Error('cannot locate file: ' + target);
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
		var dir = path.dirname(target);

		return fileIO.mkdirCheckQ(dir, true).then(() => {
			var output = this.core.context.config.toJSONString();

			// TODO un-voodoo
			return fileIO.write(target, output);
		/*}).then(() => {
			// VOODOO call Fs.stat dummy to stop node.js from reporting the file is empty (when it is not).
			// this might me a Node + Windows issue, or just my crappy workstation
			return fileIO.stat(target);
		}).then(() => {
			return Promise.delay(50);
		}).then(() => {
			// now do the real check
			return fileIO.stat(target);
		}).then((stat) => {
			if (stat.size === 0) {
				throw new Error('saveConfig written zero bytes to: ' + target + ' (looks lie');
			}*/
		}).return(target);
	}
}

export = ConfigIO;
