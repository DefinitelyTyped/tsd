/// <reference path="../_ref.d.ts" />

'use strict';

import minitable = require('minitable');

import cliUtils = require('./cliUtils');

import dateUtils = require('../../xm/dateUtils');
import stringUtils = require('../../xm/stringUtils');

import defUtil = require('../util/defUtil');

import StyledOut = require('../../xm/lib/StyledOut');

import DefVersion = require('../data/DefVersion');

class TablePrinter {

	output: StyledOut;
	indent: number = 0;

	constructor(output: StyledOut, indent: number = 0) {
		this.output = output;
		this.indent = indent;
	}

	outTweakURI(uri: string, out: any): void {
		// out.muted('<');
		uri = uri.replace(/^\w+?:\/\//, '').replace(/\/$/g, '');
		out.plain(uri);
		// out.muted('>');
	}

	fileTable(files: DefVersion[]): void {

		var builder = minitable.getBuilder(this.output.getWrite(), this.output.getStyle());

		var filePrint = builder.createType('results', [
			{ name: 'project'},
			{ name: 'slash'},
			{ name: 'name'},
			{ name: 'sep1'},
			{ name: 'commit'},
			{ name: 'sep2'},
			{ name: 'date'}
		], {
			inner: ' ',
			rowSpace: 0
		});

		var infoPrint = builder.createType('label', [
			{ name: 'label'},
			{ name: 'url'}
		], {
			inner: ' ',
			rowSpace: 0
		});

		var commitPrint = builder.createType('label', [
			{ name: 'block'}
		], {
			outer: '   ',
			rowSpace: 0
		});

		filePrint.init();
		infoPrint.init();
		commitPrint.init();

		files.sort(defUtil.fileCompare).forEach((file: DefVersion, i:number) => {
			filePrint.next();
			filePrint.row.project.out.accent(' - ').plain(file.def.project);
			filePrint.row.slash.out.accent('/');
			filePrint.row.name.out.plain(file.def.nameTerm);

			if (file.def.head !== file && file.commit) {
				filePrint.row.sep1.out.accent(':');
				filePrint.row.commit.out.plain(file.commit.commitShort);
				filePrint.row.sep2.out.accent(':');
				filePrint.row.date.out.plain(dateUtils.toNiceUTC(file.commit.changeDate));
			}

			if (file.dependencies && file.dependencies.length > 0) {
				/*filePrint.next();
				filePrint.row.project.out.ln();*/

				var deps = defUtil.mergeDependenciesOf(file.dependencies).filter((refer: DefVersion) => {
					return refer.def.path !== file.def.path;
				});
				deps.forEach((file) => {
					filePrint.next();
					filePrint.row.project.out.indent().accent('-> ').plain(file.def.project);
					filePrint.row.slash.out.accent('>');
					filePrint.row.name.out.plain(file.def.nameTerm);
				});
			}
			filePrint.close();

			if (file.info) {
				/*infoPrint.next();
				infoPrint.row.label.out.ln();*/

				if (file.info.partial) {
					infoPrint.next();
					infoPrint.row.label.out.indent().accent(' ! ').plain('partial').ln();
				}
				else {
					if (file.def.releases && file.def.releases.length > 0) {
						infoPrint.next();
						infoPrint.row.label.out.indent().accent(' v ').plain('latest');
						file.def.releases.sort(defUtil.defSemverCompare).forEach((def) => {
							infoPrint.next();
							infoPrint.row.label.out.indent().accent(' v ').plain(def.semver).ln();
						});
						/*infoPrint.next();
						infoPrint.row.label.out.ln();*/
					}

					infoPrint.next();
					infoPrint.row.label.out.indent().accent('>> ').plain(file.info.name);

					if (file.info.version) {
						infoPrint.row.label.out.plain(' ').plain(file.info.version);
					}

					file.info.projects.forEach((url) => {
						infoPrint.row.url.out.accent(': ');
						this.outTweakURI(url, infoPrint.row.url.out);
						infoPrint.next();
					});

					if (file.info.authors && file.info.authors.length > 0) {
						/*infoPrint.next();
						infoPrint.row.label.out.ln();*/
						file.info.authors.forEach((author) => {
							infoPrint.next();
							infoPrint.row.label.out.indent().accent(' @ ').plain(author.name);
							if (author.url) {
								infoPrint.row.url.out.accent(': ');
								this.outTweakURI(author.url, infoPrint.row.url.out);
							}
						});
					}

					if (file.info.externals && file.info.externals.length > 0) {
						/*infoPrint.next();
						infoPrint.row.label.out.ln();*/
						file.info.externals.forEach((external) => {
							infoPrint.next();
							infoPrint.row.label.out.indent().accent(' < ').plain(external + ' (external module)');
						});
					}
				}
				infoPrint.close();
			}

			if (file.def.history.length > 0) {

				var textWidth = cliUtils.getViewWidth(76, 96);

				// commitPrint.next();
				var out = commitPrint.row.block.out;
				out.ln();

				file.def.history.slice(0).reverse().forEach((file: DefVersion, i: number) => {
					commitPrint.next();

					out.plain(file.commit.commitShort);
					if (file.commit.changeDate) {
						out.accent(' | ').plain(dateUtils.toNiceUTC(file.commit.changeDate));
					}

					out.accent(' | ').plain(file.commit.gitAuthor.name);
					if (file.commit.hubAuthor) {
						out.accent(' @ ').plain(file.commit.hubAuthor.login);
					}
					out.ln();
					// out.ln().ln();

					stringUtils.wordWrap(file.commit.message.subject, textWidth).forEach((line: string, index: number) => {
						out.accent(' | ').line(line);
					});

					if (file.commit.message.body) {
						out.accent(' | ').ln();
						stringUtils.wordWrap(file.commit.message.body, textWidth).every((line: string, index: number) => {
							out.accent(' | ').line(line);
							if (index < 10) {
								return true;
							}
							out.accent(' | ').line('<...>');
							return false;
						});
					}

					if (i < file.def.history.length - 1) {
						out.ln();
					}
					commitPrint.close();
				});
			}
			if (file.info || file.def.history.length > 0) {
				if (i < files.length - 1) {
					filePrint.next();
					filePrint.row.project.out.ln();
					filePrint.close();
				}
			}
		});

		builder.flush();
	}
}

export = TablePrinter;
