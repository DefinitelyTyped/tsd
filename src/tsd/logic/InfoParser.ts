///<reference path="../../_ref.d.ts" />
///<reference path="../../tsd/data/DefIndex.ts" />
///<reference path="SubCore.ts" />

module tsd {
	'use strict';

	var Q = require('q');

	export class InfoParser extends tsd.SubCore {

		constructor(core:tsd.Core) {
			super(core, 'info', 'InfoParser');
		}
		/*
		 lazy load a DefVersion content and parse header for DefInfo meta data
		 promise: DefVersion: with raw .content text and .info DefInfo filled with parsed meta data
		 */
		parseDefInfo(file:tsd.DefVersion):Q.Promise<DefVersion> {
			var d:Q.Deferred<DefVersion> = Q.defer();

			this.loadContent(file).then((file:tsd.DefVersion) => {
				var parser = new tsd.DefInfoParser(this.context.verbose);
				if (file.info) {
					//TODO why not do an early bail? skip reparse?
					file.info.resetFields();
				}
				else {
					file.info = new tsd.DefInfo();
				}

				parser.parse(file.info, file.blob.content.toString('utf8'));

				if (!file.info.isValid()) {
					//this.log.warn('bad parse in: ' + file);
					//TODO print more debug info
				}
				d.resolve(file);
			}).fail(d.reject);

			return d.promise;
		}

		/*
		 bulk version of parseDefInfo()
		 promise: array: bulk results of single calls
		 */
		parseDefInfoBulk(list:tsd.DefVersion[]):Q.Promise<DefVersion[]> {
			var d:Q.Deferred<DefVersion[]> = Q.defer();
			// needed?
			list = tsd.DefUtil.uniqueDefVersion(list);

			Q.all(list.map((file:tsd.DefVersion) => {
				return this.parseDefInfo(file);

			})).then((list) => {
				d.resolve(list);
			}).fail(d.reject);

			return d.promise;
		}
	}
}
