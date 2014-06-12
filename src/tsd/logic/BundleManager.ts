/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');
import VError = require('verror');

import fileIO = require('../../xm/file/fileIO');
import getNote = require('../../xm/note/getNote');

import Options = require('../Options');
import Core = require('Core');
import CoreModule = require('./CoreModule');

import Bundle = require('../support/Bundle');

class BundleManager extends CoreModule {

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
					throw new VError('cannot locate file %s', target);
				}
				return null;
			}
			// TODO should be streaming
			return fileIO.read(target, {flags: 'rb'}).then((buffer: Buffer) => {
				bundle.parse(buffer.toString('utf8'));
			});
		}).return(bundle);
	}

	/*
	 save bundle to file
	 */
	saveBundle(bundle: Bundle): Promise<void> {
		var target = path.resolve(bundle.target);
		return fileIO.write(target, bundle.getContent());
	}
}

export = BundleManager;
