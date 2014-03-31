/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');

import fileIO = require('../../xm/file/fileIO');
import getNote = require('../../xm/note/getNote');

import Options = require('../Options');
import Core = require('Core');
import SubCore = require('./SubCore');

import Bundle = require('../support/Bundle');

class BundleManager extends SubCore {

	static bundle_init = 'bundle_init';
	static bundle_read = 'bundle_read';
	static bundle_save = 'bundle_save';
	static bundle_add = 'bundle_add';

	constructor(core: Core) {
		super(core, 'bundle', 'BundleManager');
	}

	/*
	 soft load a <reference/> bundle and add references
	 */
	addToBundle(target: string, refs: string[], save: boolean): Promise<Bundle> {
		return this.readBundle(target, true).then((bundle: Bundle) => {
			refs.forEach((ref) => {
				bundle.append(ref);
			});
			if (save) {
				return this.saveBundle(bundle).then(() => {
					return bundle;
				});
			}
			return Promise.cast(bundle);
		});
	}

	/*
	 load and parse a <reference/> bundle
	 */
	readBundle(target: string, optional: boolean): Promise<Bundle> {
		target = path.resolve(target);

		var bundle = new Bundle(target, this.core.context.getTypingsDir());

		return fileIO.exists(target).then((exists: boolean) => {
			if (!exists) {
				if (!optional) {
					throw new Error('cannot locate file: ' + target);
				}
				return null;
			}
			// TODO should be streaming
			return fileIO.read(target, {flags: 'rb'}).then((buffer: NodeBuffer) => {
				bundle.parse(buffer.toString('utf8'));
			});
		}).return(bundle);
	}

	/*
	 save bundle to file
	 */
	saveBundle(bundle: Bundle): Promise<void> {
		var target = path.resolve(bundle.target);
		var dir = path.dirname(target);

		return fileIO.mkdirCheckQ(dir, true).then(() => {
			// TODO un-voodoo
			return fileIO.write(target, bundle.getContent()).then(() => {
				// d.progress(getNote('saved bundle: ' + bundle.target));
			});
		});
	}
}

export = BundleManager;
