/// <reference path="../_ref.d.ts" />

'use strict';

import Promise = require('bluebird');
import header = require('definition-header');

import Options = require('../Options');
import Core = require('./Core');
import CoreModule = require('./CoreModule');

import DefInfo = require('../data/DefInfo');
import DefVersion = require('../data/DefVersion');
import DefBlob = require('../data/DefBlob');
import defUtil = require('../util/defUtil');

import AuthorInfo = require('../support/AuthorInfo');

class InfoParser extends CoreModule {

	constructor(core: Core) {
		super(core, 'InfoParser');
	}

	/*
	 lazy load a DefVersion content and parse header for DefInfo meta data
	 */
	parseDefInfo(file: DefVersion): Promise<DefVersion> {
		return this.core.content.loadContent(file).then((blob: DefBlob) => {
			var source = blob.content.toString('utf8');
			if (file.info) {
				// TODO why not do an early bail and skip reparse?
				file.info.resetFields();
			}
			else {
				file.info = new DefInfo();
			}

			file.info.externals = defUtil.extractExternals(source);

			if (header.isPartial(source)) {
				file.info.partial = true;
				return file;
			}

			var res: header.Result = header.parse(source);
			if (res.success) {
				var head: header.model.Header = res.value;
				file.info.name = head.label.name;
				file.info.version = (head.label.version || '');
				file.info.projects = head.project.map(p => p.url);
				file.info.authors = head.authors.map((a) => {
					return new AuthorInfo(a.name, a.url);
				});
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
