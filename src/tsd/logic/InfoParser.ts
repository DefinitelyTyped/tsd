/// <reference path="../_ref.d.ts" />

import Promise = require('bluebird');

import Options = require('../Options');
import Core = require('Core');
import SubCore = require('./SubCore');

import DefInfo = require('../data/DefInfo');
import DefVersion = require('../data/DefVersion');
import DefInfoParser = require('../support/DefInfoParser');
import defUtil = require('../util/defUtil');

class InfoParser extends SubCore {

	constructor(core: Core) {
		super(core, 'info', 'InfoParser');
	}

	/*
	 lazy load a DefVersion content and parse header for DefInfo meta data
	 */
	parseDefInfo(file: DefVersion): Promise<DefVersion> {
		return this.core.content.loadContent(file).then((file: DefVersion) => {
			var parser = new DefInfoParser();
			if (file.info) {
				// TODO why not do an early bail and skip reparse?
				file.info.resetFields();
			}
			else {
				file.info = new DefInfo();
			}

			parser.parse(file.info, file.blob.content.toString('utf8'));

			if (!file.info.isValid()) {
				// this.log.warn('bad parse in: ' + file);
				// TODO print more debug info
			}
			return file;
		});
	}

	/*
	 bulk version of parseDefInfo()
	 */
	parseDefInfoBulk(list: DefVersion[]): Promise<DefVersion[]> {
		list = defUtil.uniqueDefVersion(list);

		return Promise.map(list, (file: DefVersion) => {
			return this.parseDefInfo(file);
		});
	}
}

export = InfoParser;
