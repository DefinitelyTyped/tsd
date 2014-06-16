/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');
import Promise = require('bluebird');

import fileIO = require('../../xm/file/fileIO');

import Options = require('../Options');
import Core = require('Core');
import CoreModule = require('./CoreModule');

import Def = require('../data/Def');
import DefVersion = require('../data/DefVersion');
import defUtil = require('../util/defUtil');

import InstalledDef = require('../context/InstalledDef');

class Installer extends CoreModule {

	constructor(core: Core) {
		super(core, 'install', 'Installer');
	}

	getInstallPath(def: Def): string {
		return path.join(this.core.context.getTypingsDir(), def.path.replace(/[//\/]/g, path.sep));
	}

	/*
	 install a DefVersion and add to config
	 */
	installFile(file: DefVersion, addToConfig: boolean = true, overwrite: boolean = false): Promise<string> {
		return this.useFile(file, overwrite).then((targetPath: string) => {
			if (targetPath) {
				if (this.core.context.config.hasFile(file.def.path)) {
					this.core.context.config.getFile(file.def.path).update(file);
				}
				else if (addToConfig) {
					this.core.context.config.addFile(file);
				}
			}
			return targetPath;
		});
	}

	/*
	 bulk version of installFile()
	 */
	installFileBulk(list: DefVersion[], addToConfig: boolean = true, overwrite: boolean = true): Promise<Map<string, DefVersion>> {
		var written = new Map<string, DefVersion>();

		return Promise.map(list, (file: DefVersion) => {
			return this.installFile(file, addToConfig, overwrite).then((targetPath: string) => {
				if (targetPath) {
					written.set(file.def.path, file);
				}
			});
		}).return(written);
	}

	/*
	 reinstall multiple DefVersion's from InstalledDef data
	 */
	reinstallBulk(list: InstalledDef[], overwrite: boolean = false): Promise<Map<string, DefVersion>> {
		var written = new Map<string, DefVersion>();

		return Promise.map(list, (installed: InstalledDef) => {
			return this.core.index.procureFile(installed.path, installed.commitSha).then((file: DefVersion) => {
				return this.installFile(file, true, overwrite).then((targetPath: string) => {
					if (targetPath) {
						written.set(file.def.path, file);
					}
					return file;
				});
			});
		}).return(written);
	}

	/*
	 lazy load and save a single DefVersion to typings folder
	 */
	useFile(file: DefVersion, overwrite: boolean): Promise<string> {
		var targetPath = this.getInstallPath(file.def);

		return fileIO.canWriteFile(targetPath, overwrite).then((canWrite: boolean) => {
			if (!canWrite) {
				if (!overwrite) {
					// d.progress(getNote('skipped existing: ' + file.def.path));
				}
				return null;
			}
			// write
			return this.core.content.loadContent(file).then((blob) => {
				return fileIO.write(targetPath, blob.content);
			}).return(targetPath);
		});
	}

	/*
	 bulk version of useFile()
	 */
	useFileBulk(list: DefVersion[], overwrite: boolean = true): Promise<Map<string, DefVersion>> {
		// needed?
		list = defUtil.uniqueDefVersion(list);

		// this could be a bit more then just 'written'
		var written = new Map<string, DefVersion>();

		return Promise.map(list, (file: DefVersion) => {
			return this.useFile(file, overwrite).then((targetPath: string) => {
				if (targetPath) {
					written.set(file.def.path, file);
				}
			});
		}).return(written);
	}
}

export = Installer;
