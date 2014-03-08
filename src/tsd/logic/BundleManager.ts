/// <reference path="../../_ref.d.ts" />
/// <reference path="../Core.ts" />
/// <reference path="SubCore.ts" />
/// <reference path="../support/Bundle.ts" />

module tsd {
	'use strict';

	var Q = require('q');
	var fs = require('fs');
	var path = require('path');
	var FS:typeof QioFS = require('q-io/fs');

	export class BundleManager extends tsd.SubCore {

		static bundle_init = 'bundle_init';
		static bundle_read = 'bundle_read';
		static bundle_save = 'bundle_save';
		static bundle_add = 'bundle_add';

		constructor(core:tsd.Core) {
			super(core, 'bundle', 'BundleManager');
		}

		/*
		 soft load a <reference/> bundle and add references
		 promise: a tsd.Bundle
		 */
		addToBundle(target:string, refs:string[], save:boolean):Q.Promise<tsd.Bundle> {
			var d:Q.Deferred<tsd.Bundle> = Q.defer();
			this.track.promise(d.promise, BundleManager.bundle_add, target);

			this.readBundle(target, true).then((bundle:tsd.Bundle) => {
				refs.forEach((ref) => {
					bundle.append(ref);
				});
				if (save) {
					return this.saveBundle(bundle).progress(d.notify).then(() => {
						d.resolve(bundle);
					});
				}
				d.resolve(bundle);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 load and parse a <reference/> bundle
		 promise: a tsd.Bundle
		 */
		readBundle(target:string, optional:boolean):Q.Promise<tsd.Bundle> {
			var d:Q.Deferred<tsd.Bundle> = Q.defer();
			this.track.promise(d.promise, BundleManager.bundle_read, target);

			target = path.resolve(target);

			var bundle = new Bundle(target, this.core.context.getTypingsDir());

			FS.exists(target).then((exists:boolean) => {
				if (!exists) {
					if (!optional) {
						d.reject(new Error('cannot locate file: ' + target));
					}
					else {
						d.resolve(bundle);
					}
					return;
				}
				// TODO should be streaming
				return FS.read(target, {flags: 'rb'}).then((buffer:NodeBuffer) => {
					bundle.parse(buffer.toString('utf8'));
					d.resolve(bundle);
				});
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 save bundle to file
		 promise: void
		 */
		saveBundle(bundle:tsd.Bundle):Q.Promise<void> {
			var d:Q.Deferred<void> = Q.defer();

			var target = path.resolve(bundle.target);
			var dir = path.dirname(target);

			this.track.promise(d.promise, BundleManager.bundle_save, target);

			xm.file.mkdirCheckQ(dir, true).then(() => {
				// TODO un-voodoo
				return FS.write(target, bundle.getContent()).then(() => {
					d.notify(xm.getNote('saved bundle: ' + bundle.target));
					d.resolve();
				});
			}).fail(d.reject);

			return d.promise;
		}
	}
}
