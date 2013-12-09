///<reference path="../_ref.ts" />
///<reference path="../../xm/DateUtil.ts" />
///<reference path="../../xm/io/StyledOut.ts" />
///<reference path="../../git/model/GitRateInfo.ts" />
///<reference path="../../tsd/data/_all.ts" />
///<reference path="../../tsd/API.ts" />

module tsd {
	export module cli {

		var lineSplitExp = /[ \t]*[\r\n][ \t]*/g;

		export class Printer {

			output:xm.StyledOut;
			indent:number = 0;

			constructor(output:xm.StyledOut, indent:number = 0) {
				this.output = output;
				this.indent = indent;
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
						this.output.accent(sep).span(xm.DateUtil.toNiceUTC(file.commit.changeDate));
					}
				}
				else {
					if (file.commit) {
						this.output.span(file.commit.commitShort);
						if (file.commit.changeDate) {
							this.output.accent(sep).span(xm.DateUtil.toNiceUTC(file.commit.changeDate));
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

					//TODO full indent message
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
						this.output.indent(2).tweakBraces(file.info.projectUrl, true).ln();

						file.info.authors.forEach((author:xm.AuthorInfo) => {
							this.output.ln();
							this.output.indent(2).tweakBraces(author.toString(), true).ln();
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
				//TODO fix pluralised reporting
				if (result.written.keys().length === 0) {
					this.output.ln().report(true).span('written ').accent('zero').span(' files').ln();
				}
				else if (result.written.keys().length === 1) {
					this.output.ln().report(true).span('written ').accent(result.written.keys().length).span(' file:').ln().ln();
				}
				else {
					this.output.ln().report(true).span('written ').accent(result.written.keys().length).span(' files:').ln().ln();
				}

				//TODO report on written/skipped
				result.written.keys().sort().forEach((path:string) => {
					var file:tsd.DefVersion = result.written.get(path);
					this.output.indent().bullet(true).glue(this.file(file)).ln();
				});
				this.output.ln().report(true).span('install').space().success('success!').ln();
				return this.output;
			}

			rateInfo(info:git.GitRateInfo):xm.StyledOut {
				this.output.line();
				this.output.report(true).span('rate-limit').sp();
				//TODO clean this up
				if (info.limit > 0) {
					if (info.remaining === 0) {
						this.output.error('remaining ' + info.remaining).span(' of ').span(info.limit).span(' -> ').error(info.getResetString());
					}
					else if (info.remaining < 15) {
						this.output.warning('remaining ' + info.remaining).span(' of ').span(info.limit).span(' -> ').warning(info.getResetString());
					}
					else if (info.remaining < info.limit - 15) {
						this.output.accent('remaining ' + info.remaining).span(' of ').span(info.limit).span(' -> ').accent(info.getResetString());
					}
					else {
						this.output.success('remaining ' + info.remaining).span(' of ').span(info.limit);
					}
				}
				else {
					this.output.success(info.getResetString());
				}
				return this.output.ln();
			}
		}
	}
}
