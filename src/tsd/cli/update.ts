/// <reference path="../_ref.ts" />

module tsd {
	export module cli {
		'use strict';

		var path = require('path');
		var Q = require('q');

		var updateNotifier = require('update-notifier');

		// keep a global ref
		var notifier;

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		export function runUpdateNotifier(context:tsd.Context, promise:boolean = false):Q.Promise<any> {
			return Q.resolve().then(() => {
				var defer = Q.defer();
				if (notifier) {
					return Q.resolve(notifier);
				}
				// switch it we want to wait for this
				var callback = (promise ? (err, update) => {
					if (err) {
						notifier = null;
						defer.reject(err);
					}
					else {
						notifier.update = update;
						defer.resolve(notifier);
					}
				} : undefined);

				var settings:any = {
					packageName: context.packageInfo.name,
					packageVersion: context.packageInfo.version,
					updateCheckInterval: 86400000,
					//updateCheckTimeout: null,
					//registryUrl: null,
					callback: callback
				};
				notifier = updateNotifier(settings);
				if (!callback) {
					defer.resolve(notifier);
				}
				return defer.promise;
			});
		}

		export function showUpdateNotifier(output:xm.StyledOut, context?:tsd.Context, promise:boolean = false):Q.Promise<void> {
			return Q.resolve().then(() => {
				if (context) {
					return runUpdateNotifier(context, promise);
				}
				return notifier;
			}).then((notifier) => {
				if (notifier && notifier.update) {
					output.ln();
					output.report(true).span('update available: ');
					output.tweakPunc(notifier.update.current).accent(' -> ').tweakPunc(notifier.update.latest);
					output.ln().ln();
					output.indent().shell(true).span('npm update ' + notifier.update.name + ' -g');
					output.ln();

					notifier = null;
				}
			});
		}
	}
}
