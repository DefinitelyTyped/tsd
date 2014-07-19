/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');
import Promise = require('bluebird');
import updateNotifier = require('update-notifier');

import StyledOut = require('../../xm/lib/StyledOut');

import Context = require('../context/Context');

// keep a global ref
var notifier;

export function runNotifier(context: Context, waitForIt: boolean = false): Promise<any> {
	var opts = context.settings.getChild('update-notifier');

	return new Promise((resolve, reject) => {
		if (notifier || !opts.getBoolean('enabled', true)) {
			resolve(notifier);
			return;
		}
		// switch if we want to wait for this
		var callback;
		if (waitForIt) {
			callback = (err, update) => {
				if (err) {
					notifier = null;
					reject(err);
				}
				else {
					notifier.update = update;
					resolve(notifier);
				}
			};
		};

		var settings: any = {
			packageName: context.packageInfo.name,
			packageVersion: context.packageInfo.version,
			updateCheckInterval: opts.getDurationSecs('updateCheckInterval', 24 * 3600) * 1000,
			updateCheckTimeout: opts.getDurationSecs('updateCheckTimeout', 10) * 1000,
			registryUrl: opts.getString('registryUrl'),
			callback: callback
		};

		notifier = updateNotifier(settings);
		if (!callback) {
			resolve(notifier);
		}
	});
}

export function showNotifier(output: StyledOut): Promise<void> {
	return Promise.attempt(() => {
		if (notifier && notifier.update) {
			if (notifier.update.type === 'major' || notifier.update.type === 'minor') {
				output.ln();
				output.report(true).span('update available: ');
				output.tweakPunc(notifier.update.current).accent(' -> ').tweakPunc(notifier.update.latest);
				output.ln().ln();
				output.indent().shell(true).span('npm update ' + notifier.update.name + ' -g');
				output.ln();
			}
			notifier = null;
		}
	});
}
