/// <reference path="../_ref.ts" />
/// <reference path="../../xm/date.ts" />
/// <reference path="../../xm/StyledOut.ts" />
/// <reference path="../../git/model/GitRateInfo.ts" />
/// <reference path="../../tsd/data/_all.ts" />
/// <reference path="../../tsd/API.ts" />

module tsd {
	'use strict';

	export module cli {

		var lineSplitExp = /[ \t]*[\r\n][ \t]*/g;

		export class Printer {

			output:xm.StyledOut;
			indent:number = 0;

			private _remainingPrev:number = -1;

			constructor(output:xm.StyledOut, indent:number = 0) {
				this.output = output;
				this.indent = indent;
			}

			fmtSortKey(key:string):string {
				return String(key).substr(0, 6);
			}

			fmtGitURI(str:string):string {
				return String(str).replace(/https:\/\/[a-z]+\.github\.com\/(?:repos\/)?/g, '').replace(/([0-9a-f]{40})/g, (match, p1) => {
					return this.fmtSortKey(p1);
				});
			}

			file(file:tsd.DefVersion, sep:string = ' : '):xm.StyledOut {
				if (file.def) {
					this.output.tweakPath(file.def.path);
				}
				else {
					this.output.accent('<no def>');
				}
				return this.output.accent(sep).glue(this.fileEnd(file, sep));
			}

			fileEnd(file:tsd.DefVersion, sep:string = ' | '):xm.StyledOut {
				if (file.def && file.def.head === file) {
					this.output.span('<head>');
					if (file.commit.changeDate) {
						this.output.accent(sep).span(xm.date.toNiceUTC(file.commit.changeDate));
					}
				}
				else {
					if (file.commit) {
						this.output.span(file.commit.commitShort);
						if (file.commit.changeDate) {
							this.output.accent(sep).span(xm.date.toNiceUTC(file.commit.changeDate));
						}
					}
					else {
						this.output.accent(sep).accent('<no commit>');
					}
				}
				/*if (file.blob) {
				 this.output.span(sep).span(file.blob.shaShort);
				 }*/
				return this.output;
			}

			fileCommit(file:tsd.DefVersion, skipNull:boolean = false):xm.StyledOut {
				var sep = '  |  ';
				if (file.commit) {
					this.output.indent(1).glue(this.fileEnd(file, sep));
					this.output.accent(sep).span(file.commit.gitAuthor.name);
					if (file.commit.hubAuthor) {
						this.output.accent('  @  ').span(file.commit.hubAuthor.login);
					}
					this.output.ln().ln();

					this.output.indent(1).edge(true).line(file.commit.message.subject);

					if (file.commit.message.body) {
						this.output.indent(1).edge(true).ln();

						file.commit.message.body.split(lineSplitExp).every((line:string, index:number, lines:string[]) => {
							this.output.indent(1).edge(true).line(line);
							if (index < 10) {
								return true;
							}
							this.output.indent(1).edge(true).line('<...>');
							return false;
						});
					}
				}
				else if (!skipNull) {
					this.output.indent(1).accent('<no commmit>').ln();
				}
				return this.output;
			}

			fileHead(file:tsd.DefVersion):xm.StyledOut {
				return this.output.indent(0).bullet(true).glue(this.file(file)).ln();
			}

			fileInfo(file:tsd.DefVersion, skipNull:boolean = false):xm.StyledOut {
				if (file.info) {
					this.output.line();
					if (file.info.isValid()) {
						this.output.indent(1).tweakPunc(file.info.toString()).ln();
						this.output.indent(2).tweakAll(file.info.projectUrl, true).ln();

						file.info.authors.forEach((author:xm.AuthorInfo) => {
							this.output.ln();
							this.output.indent(2).tweakAll(author.toString(), true).ln();
						});
					}
					else {
						this.output.indent(1).accent('<invalid info>').line();
					}
				}
				else if (!skipNull) {
					this.output.line();
					this.output.indent(1).accent('<no info>').line();
				}
				return this.output;
			}

			dependencies(file:tsd.DefVersion):xm.StyledOut {
				if (file.dependencies.length > 0) {
					this.output.line();
					var deps = tsd.DefUtil.mergeDependenciesOf(file.dependencies).filter((refer:tsd.DefVersion) => {
						return refer.def.path !== file.def.path;
					});
					if (deps.length > 0) {
						deps.filter((refer:tsd.DefVersion) => {
							return refer.def.path !== file.def.path;
						}).sort(tsd.DefUtil.fileCompare).forEach((refer:tsd.DefVersion) => {
							this.output.indent(1).report(true).glue(this.file(refer)).ln();

							if (refer.dependencies.length > 0) {
								refer.dependencies.sort(tsd.DefUtil.defCompare).forEach((dep:tsd.Def) => {
									this.output.indent(2).bullet(true).tweakPath(dep.path).ln();
								});
								this.output.ln();
							}
						});
					}
				}
				return this.output;
			}

			history(file:tsd.DefVersion):xm.StyledOut {
				if (file.def.history.length > 0) {
					this.output.line();
					file.def.history.slice(0).reverse().forEach((file:tsd.DefVersion, i:number) => {
						this.fileCommit(file);
						this.output.cond(i < file.def.history.length - 1, '\n');
					});
				}
				return this.output;
			}

			installResult(result:tsd.InstallResult):xm.StyledOut {
				var keys = xm.keysOf(result.written);
				if (keys.length === 0) {
					this.output.ln().report(true).span('written ').accent('zero').span(' files').ln();
				}
				else if (keys.length === 1) {
					this.output.ln().report(true).span('written ').accent(keys.length).span(' file:').ln().ln();
				}
				else {
					this.output.ln().report(true).span('written ').accent(keys.length).span(' files:').ln().ln();
				}

				// TODO report on written/skipped
				keys.sort().forEach((path:string) => {
					var file:tsd.DefVersion = result.written.get(path);
					this.output.indent().bullet(true).glue(this.file(file)).ln();
				});
				this.output.ln().report(true).span('install').space().success('success!').ln();
				return this.output;
			}

			rateInfo(info:git.GitRateInfo, note:boolean = false):xm.StyledOut {
				if (info.remaining === this._remainingPrev) {
					return this.output;
				}
				this._remainingPrev = info.remaining;
				if (info.remaining === info.limit) {
					return this.output;
				}

				if (note) {
					this.output.indent(1).report(true).span('rate-limit').sp();
				}
				else {
					this.output.line();
					this.output.report(true).span('rate-limit').sp();
				}
				/* tslint:disable:max-line-length */
				if (info.limit > 0) {
					if (info.remaining === 0) {
						this.output.span('remaining ').error(info.remaining).span(' / ').error(info.limit).span(' -> ').error(info.getResetString());
					}
					else if (info.remaining < 15) {
						this.output.span('remaining ').warning(info.remaining).span(' / ').warning(info.limit).span(' -> ').warning(info.getResetString());
					}
					else if (info.remaining < info.limit - 15) {
						this.output.span('remaining ').success(info.remaining).span(' / ').success(info.limit).span(' -> ').success(info.getResetString());
					}
					else {
						this.output.span('remaining ').accent(info.remaining).span(' / ').accent(info.limit);
					}
				}
				/* tslint:enable:max-line-length */
				else {
					this.output.success(info.getResetString());
				}
				return this.output.ln();
			}
		}
	}
}
