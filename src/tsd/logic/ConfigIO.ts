/// <reference path="../../_ref.d.ts" />
/// <reference path="../../tsd/data/DefIndex.ts" />
/// <reference path="../Core.ts" />
/// <reference path="../Options.ts" />
/// <reference path="SubCore.ts" />

module tsd {
	'use strict';

	var Q = require('q');
	var fs = require('fs');
	var path = require('path');
	var FS:typeof QioFS = require('q-io/fs');
	var pointer = require('json-pointer');

	export class ConfigIO extends tsd.SubCore {

		static config_init = 'config_init';
		static config_read = 'config_read';
		static config_save = 'config_save';

		constructor(core:tsd.Core) {
			super(core, 'config', 'ConfigIO');
		}

		/*
		 load the current configFile, optional to not throw error on missing file
		 promise: path of config file
		 */
		initConfig(overwrite:boolean):Q.Promise<string> {
			var d:Q.Deferred<string> = Q.defer();
			var target = this.core.context.paths.configFile;

			this.track.promise(d.promise, ConfigIO.config_init, target);

			FS.exists(target).then((exists:boolean) => {
				if (exists) {
					if (!overwrite) {
						throw new Error('cannot overwrite file: ' + target);
					}
					return FS.remove(target);
				}
				return null;
			}).then(() => {
				this.core.context.config.reset();
				return this.saveConfig().then((target) => {
					d.resolve(target);
				});
			}).fail(d.reject).done();

			return d.promise;
		}

		/*
		 load the current configFile, optional to not throw error on missing file
		 promise: null
		 */
		readConfig(optional:boolean = false):Q.Promise<void> {
			var d:Q.Deferred<void> = Q.defer();
			var target = this.core.context.paths.configFile;

			this.track.promise(d.promise, ConfigIO.config_read, target);

			FS.exists(target).then((exists:boolean) => {
				if (!exists) {
					if (!optional) {
						d.reject(new Error('cannot locate file: ' + target));
					}
					else {
						d.resolve(null);
					}
					return;
				}
				return FS.read(target, {flags: 'r'}).then((json:string) => {
					this.core.context.config.parseJSONString(json, target);
					this.core.updateConfig();
					d.resolve(null);
				});
			}).fail(d.reject).done();

			return d.promise;
		}

		/*
		 save current config to json
		 promise: string: path of written file
		 */
		saveConfig(target?:string):Q.Promise<string> {
			var d:Q.Deferred<string> = Q.defer();

			target = target || this.core.context.paths.configFile;
			var dir = path.dirname(target);

			this.track.promise(d.promise, ConfigIO.config_save, target);

			xm.file.mkdirCheckQ(dir, true).then(() => {
				var output = this.core.context.config.toJSONString();

				// TODO un-voodoo
				return FS.write(target, output).then(() => {
					// VOODOO call Fs.stat dummy to stop node.js from reporting the file is empty (when it is not).
					// this might me a Node + Windows issue, or just my crappy workstation
					return FS.stat(target);
				}).then(() => {
					return Q.delay(50);
				}).then(() => {
					// now do the real check
					return FS.stat(target).then((stat) => {
						if (stat.size === 0) {
							throw new Error('saveConfig written zero bytes to: ' + target + ' (looks lie');
						}
					});
				});
			}).then(() => {
				d.resolve(target);
			}, d.reject).done();

			return d.promise;
		}
	}
}
