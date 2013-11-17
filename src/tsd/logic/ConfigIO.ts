///<reference path="../../_ref.d.ts" />
///<reference path="../../tsd/data/DefIndex.ts" />
///<reference path="SubCore.ts" />

module tsd {
	'use strict';

	var Q = require('q');
	var fs = require('fs');
	var path = require('path');
	var FS:typeof QioFS = require('q-io/fs');
	var pointer = require('json-pointer');

	export class ConfigIO extends tsd.SubCore {

		constructor(core:tsd.Core) {
			super(core, 'config', 'ConfigIO');
		}

		/*
		 load the current configFile, optional to not throw error on missing file
		 promise: null
		 */
		readConfig(optional:boolean = false):Q.Promise<void> {
			var d:Q.Deferred<void> = Q.defer();
			var target = this.core.context.paths.configFile;

			this.track.promise(d.promise, 'config_read', target);

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
				return xm.FileUtil.readJSONPromise(target).then((json) => {
					this.core.context.config.parseJSON(json);
					d.resolve(null);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 save current config to json
		 promise: string: path of written file
		 */
		saveConfig():Q.Promise<string> {
			var d:Q.Deferred<string> = Q.defer();

			var target = this.core.context.paths.configFile;
			var dir = path.dirname(target);

			this.track.promise(d.promise, 'config_save', target);

			var obj = this.core.context.config.toJSON();
			if (!obj) {
				return Q.reject(new Error('config exported null json (if this is reproducible please send a support ticket)'));
			}
			var json = JSON.stringify(obj, null, 2);
			if (!json) {
				return Q.reject(new Error('config could not be serialised to JSON'));
			}

			xm.FileUtil.mkdirCheckQ(dir, true).then(() => {
				return FS.write(target, json).then(() => {
					//VOODOO call Fs.stat dummy to stop node.js from reporting the file is empty (when it is not).
					//this might me a Node + Windows issue, or just my crappy workstation
					return FS.stat(target);
				}).then(() => {
					return Q.delay(100);
				}).then(() => {
					//now do the real check
					return FS.stat(target).then((stat) => {
						if (stat.size === 0) {
							throw new Error('saveConfig written zero bytes to: ' + target + ' (looks lie');
						}
					});
				});
			}).then(() => {
				d.resolve(target);
			}, d.reject);

			return d.promise;
		}
	}
}
