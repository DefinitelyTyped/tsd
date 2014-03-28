/// <reference path="../../_ref.d.ts" />
/// <reference path="../../tsd/data/DefIndex.ts" />
/// <reference path="../../xm/file.ts" />
/// <reference path="SubCore.ts" />

module tsd {
	'use strict';

	var Q = require('q');
	var path = require('path');
	var FS:typeof QioFS = require('q-io/fs');

	export class Installer extends tsd.SubCore {

		constructor(core:tsd.Core) {
			super(core, 'install', 'Installer');
		}

		/*
		 install a DefVersion and add to config
		 promise: string: absolute path of written file
		 */
		installFile(file:tsd.DefVersion, addToConfig:boolean = true, overwrite:boolean = false):Q.Promise<string> {
			var d:Q.Deferred<string> = Q.defer();
			this.track.promise(d.promise, 'file');

			this.useFile(file, overwrite).progress(d.notify).then((targetPath:string) => {
				if (targetPath) {
					if (this.core.context.config.hasFile(file.def.path)) {
						this.core.context.config.getFile(file.def.path).update(file);
					}
					else if (addToConfig) {
						this.core.context.config.addFile(file);
					}
				}
				d.resolve(targetPath);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 bulk version of installFile()
		 promise: Map: mapping path of written file -> DefVersion
		 */
		installFileBulk(list:tsd.DefVersion[], addToConfig:boolean = true, overwrite:boolean = true):Q.Promise<Map<string, DefVersion>> {
			var d:Q.Deferred<Map<string, DefVersion>> = Q.defer();
			this.track.promise(d.promise, 'file_bulk');

			var written = new Map<string, DefVersion>();

			Q.all(list.map((file:tsd.DefVersion) => {
				return this.installFile(file, addToConfig, overwrite).progress(d.notify).then((targetPath:string) => {
					if (targetPath) {
						written.set(file.def.path, file);
					}
				});
			})).then(() => {
				d.resolve(written);
			}, d.reject);

			return d.promise;
		}

		/*
		 reinstall multiple DefVersion's from InstalledDef data
		 promise: Map: mapping path of written file -> DefVersion
		 */
		reinstallBulk(list:tsd.InstalledDef[], overwrite:boolean = false):Q.Promise<Map<string, DefVersion>> {
			var d:Q.Deferred<Map<string, DefVersion>> = Q.defer();
			this.track.promise(d.promise, 'reinstall_bulk');

			var written = new Map<string, DefVersion>();

			Q.all(list.map((installed:tsd.InstalledDef) => {
				return this.core.index.procureFile(installed.path, installed.commitSha).progress(d.notify).then((file:tsd.DefVersion) => {
					return this.installFile(file, true, overwrite).progress(d.notify).then((targetPath:string) => {
						if (targetPath) {
							written.set(file.def.path, file);
						}
						return file;
					});
				});
			})).then(() => {
				d.resolve(written);
			}, d.reject);

			return d.promise;
		}

		/*
		 lazy load and save a single DefVersion to typings folder
		 promise: DefVersion
		 */
		useFile(file:tsd.DefVersion, overwrite:boolean):Q.Promise<string> {
			var d:Q.Deferred<string> = Q.defer();
			this.track.promise(d.promise, 'use', file.key);

			var targetPath = this.core.getInstallPath(file.def);

			xm.file.canWriteFile(targetPath, overwrite).then((canWrite:boolean) => {
				if (!canWrite) {
					if (!overwrite) {
						d.notify(xm.getNote('skipped existing: ' + file.def.path));
					}
					d.resolve(null);
					return;
				}
				// write
				return this.core.content.loadContent(file).progress(d.notify).then(() => {
					// check again? (race?)
					return FS.exists(targetPath);
				}).then((exists) => {
					if (exists) {
						return FS.remove(targetPath);
					}
				}).then(() => {
					return xm.file.mkdirCheckQ(path.dirname(targetPath), true);
				}).then(() => {
					return FS.write(targetPath, file.blob.content);
				}).then(() => {
					d.resolve(targetPath);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 bulk version of useFile()
		 promise: Map: mapping absolute path of written file -> DefVersion
		 */
		useFileBulk(list:tsd.DefVersion[], overwrite:boolean = true):Q.Promise<Map<string, DefVersion>> {
			var d:Q.Deferred<Map<string, DefVersion>> = Q.defer();
			this.track.promise(d.promise, 'use_bulk');

			// needed?
			list = tsd.DefUtil.uniqueDefVersion(list);

			// this could be a bit more then just 'written'
			var written = new Map<string, DefVersion>();

			Q.all(list.map((file:tsd.DefVersion) => {
				return this.useFile(file, overwrite).progress(d.notify).then((targetPath:string) => {
					if (targetPath) {
						written.set(file.def.path, file);
					}
				});
			})).then(() => {
				d.resolve(written);
			}, d.reject);

			return d.promise;
		}
	}
}
