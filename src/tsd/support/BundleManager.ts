/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');
import VError = require('verror');

import fileIO = require('../../xm/fileIO');

import Bundle = require('../support/Bundle');
import BundleChange = require('../support/BundleChange');

class BundleManager {

	typingsDir: string;

	constructor(typingsDir: string) {
		this.typingsDir = typingsDir;
	}

	/*
	 soft load a <reference/> bundle and add references
	 */
	addToBundle(target: string, refs: string[], save: boolean): Promise<BundleChange> {
		return this.readBundle(target, true).then((bundle: Bundle) => {
			var change = new BundleChange(bundle);

			refs.forEach((ref) => {
				change.add(bundle.append(ref));
			});
			if (save && change.someAdded()) {
				return this.saveBundle(bundle).return(change);
			}
			return Promise.resolve(change);
		});
	}

	/*
	 load and parse a <reference/> bundle
	 */
	readBundle(target: string, optional: boolean): Promise<Bundle> {
		target = path.resolve(target);

		var bundle = new Bundle(target, this.typingsDir);

		return fileIO.exists(target).then((exists: boolean) => {
			if (!exists) {
				if (!optional) {
					throw new VError('cannot locate file %s', target);
				}
				return Promise.resolve(bundle);
			}
			// TODO should be streaming
			return fileIO.read(target, {flags: 'rb'}).then((buffer: Buffer) => {
				bundle.parse(buffer.toString('utf8'));
			}).return(bundle);
		});
	}

	/*
	 remove non-existing paths
	 */
	cleanupBundle(target: string, save: boolean): Promise<BundleChange> {
		target = path.resolve(target);

		return this.readBundle(target, true).then((bundle: Bundle) => {
			var change = new BundleChange(bundle);

			return Promise.map(bundle.toArray(), (full: string) => {
				return fileIO.exists(full).then((exists) => {
					if (!exists) {
						change.remove(bundle.remove(full));
					}
				});
			}).then(() => {
				if (save && change.someRemoved()) {
					return this.saveBundle(bundle);
				}
				return Promise.resolve();
			}).return(change);
		});
	}

	/*
	 remove non-existing paths
	 */
	updateBundle(target: string, save: boolean): Promise<BundleChange> {
		target = path.resolve(target);

		return this.cleanupBundle(target, false).then((change) => {
			return fileIO.glob('*/*.d.ts', <any>{
				cwd: change.bundle.baseDir
			}).then((paths) => {
				paths.forEach((def) => {
					var full = path.resolve(change.bundle.baseDir, def);
					change.add(change.bundle.append(full));
				});
				if (save && change.someChanged()) {
					return this.saveBundle(change.bundle);
				}
				return Promise.resolve();
			}).return(change);
		});
	}

	/*
	 save bundle to file
	 */
	saveBundle(bundle: Bundle): Promise<void> {
		var target = path.resolve(bundle.target);
		return fileIO.write(target, bundle.stringify());
	}

	/*
	 save empty bundle file
	 */
	saveEmptyBundle(target: string): Promise<void> {
		target = path.resolve(target);
		return fileIO.exists(target).then((exists) => {
			if (!exists) {
				return fileIO.write(target, '\n');
			}
		});
	}
}

export = BundleManager;
