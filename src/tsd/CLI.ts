///<reference path="_ref.ts" />
///<reference path="../xm/Logger.ts" />
///<reference path="../xm/io/Expose.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/io/StyledOut.ts" />
///<reference path="../xm/DateUtil.ts" />
///<reference path="../xm/ObjectUtil.ts" />
///<reference path="context/Context.ts" />
///<reference path="select/Query.ts" />
///<reference path="cli/options.ts" />
///<reference path="cli/const.ts" />

module tsd {
	'use strict';

	var path = require('path');
	var Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var Opt = tsd.cli.Opt;
	var Group = tsd.cli.Group;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var output = new xm.StyledOut();

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export var styleMap = new xm.KeyValueMap<(ctx:xm.ExposeContext) => void>();

	styleMap.set('no', (ctx:xm.ExposeContext) => {
		output.useStyler(new xm.styler.NoStyler());
	});
	styleMap.set('plain', (ctx:xm.ExposeContext) => {
		output.useStyler(new xm.styler.PlainStyler());
	});
	styleMap.set('ansi', (ctx:xm.ExposeContext) => {
		output.useStyler(new xm.styler.ANSIStyler());
	});
	styleMap.set('html', (ctx:xm.ExposeContext) => {
		output.useStyler(new xm.styler.HTMLWrapStyler());
	});
	styleMap.set('css', (ctx:xm.ExposeContext) => {
		output.useStyler(new xm.styler.CSSStyler());
	});
	styleMap.set('dev', (ctx:xm.ExposeContext) => {
		output.useStyler(new xm.styler.DevStyler());
	});

	export function useColor(color:string, ctx:xm.ExposeContext) {
		if (styleMap.has(color)) {
			styleMap.get(color)(ctx);
		}
		else {
			styleMap.get('no')(ctx);
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function printPreviewNotice():Q.Promise<void> {
		var pkg = xm.PackageJSON.getLocal();

		output.line()
		.span('->').space().span(pkg.getNameVersion())
		.space().accent('(preview)').line()
			//.clear().span(pkg.getHomepage(true)).line()
		.ruler().line();
		//TODO implement version check / news service
		return Q.resolve();
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var pleonasm;
	var pleonasmPromise;

	function loadPleonasm():Q.Promise<void> {
		if (pleonasmPromise) {
			return pleonasmPromise;
		}

		return Q.resolve();

		/*var d:Q.Deferred<void> = Q.defer();
		 pleonasmPromise = d.promise;

		 pleonasm = require('pleonasm');
		 pleonasm.onload = () => {
		 xm.log('pleonasm.onload');
		 d.resolve();
		 };
		 return d.promise;*/
	}

	function pleo(input) {
		input = input.substring(0, 6);
		if (pleonasm) {
			return '\'' + pleonasm.encode(input, '_', '_').code + '\'';
		}
		else {
			return input;
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function getContext(ctx:xm.ExposeContext):tsd.Context {
		xm.assertVar(ctx, xm.ExposeContext, 'ctx');

		var context = new tsd.Context(ctx.getArg(Opt.config), ctx.getArg(Opt.verbose));

		if (ctx.getArg(Opt.dev)) {
			context.paths.cacheDir = path.resolve(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
		}
		else if (ctx.hasArg(Opt.cacheDir)) {
			context.paths.cacheDir = path.resolve(ctx.getArg(Opt.cacheDir));
		}
		else {
			context.paths.cacheDir = tsd.Paths.getUserCacheDir();
		}
		return context;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//TODO further unify reporting format (consistent details and don't rely on toString()'s) (See TODO.md)

	function reportError(err:any) {
		output.error('-> ' + 'an error occured!').clear();

		if (err.stack) {
			output.block(err.stack);
		}
		else {
			output.line(err);
		}
	}

	function reportProgress(obj:any) {
		output.accent(output.nibs.arrow).inspect(obj, 3);
	}

	function reportSucces(result:tsd.APIResult) {
		//output.ln().span('->').space().success('success!').clear();
		if (result) {
			result.selection.forEach((def:tsd.DefVersion) => {
				output.line(def.toString());
				if (def.info) {
					output.line(def.info.toString());
					output.line(def.info);
				}
			});
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function formatFile(file:tsd.DefVersion) {
		var sep = '  |' +
		'  ';
		var str = '';
		if (file.def) {
			str += file.def.path;
		}
		else {
			str += '<no def>';
		}
		str += sep + formatFileEnd(file, sep);
		return str;
	}


	function formatFileEnd(file:tsd.DefVersion, sep:string) {
		var str = '';
		if (file.def && file.def.head === file) {
			str += '<head>';
			if (file.commit.changeDate) {
				str += sep + xm.DateUtil.toNiceUTC(file.commit.changeDate);
			}
		}
		else {
			if (file.commit) {
				str += file.commit.commitShort;
				if (file.commit.changeDate) {
					str += sep + xm.DateUtil.toNiceUTC(file.commit.changeDate);
				}
			}
			else {
				str += sep + '<no commit>';
			}
		}
		/*if (file.blob) {
		 str += sep + file.blob.shaShort;
		 }*/
		return str;
	}

	function printFileCommit(file:tsd.DefVersion, skipNull:boolean = false) {
		var sep = '  |  ';

		if (file.commit) {
			var str = '   ';
			str += formatFileEnd(file, sep);
			str += sep + file.commit.gitAuthor.name;
			if (file.commit.hubAuthor) {
				str += '  @  ' + file.commit.hubAuthor.login;
			}
			output.line(str);

			//TODO full indent message
			output.line();
			output.line('   ' + file.commit.message.subject);
			output.ruler2();
		}
		else if (!skipNull) {
			output.line('   ' + '<no commmit>');
			output.ruler2();
		}
	}

	function printSubHead(text:string) {
		output.line(' ' + text);
		output.ruler2();
	}

	function printDefHead(def:tsd.Def) {
		output.line(def.toString());
		output.ruler2();
	}

	function printFileHead(file:tsd.DefVersion) {
		printFile(file);
		output.ruler2();
	}

	function printFile(file:tsd.DefVersion) {
		output.line(formatFile(file));
	}

	function printFileInfo(file:tsd.DefVersion, skipNull:boolean = false) {
		if (file.info) {
			if (file.info.isValid()) {
				output.line('   ' + file.info.toString());
				output.line('      ' + file.info.projectUrl);
				file.info.authors.forEach((author:xm.AuthorInfo) => {
					output.line('      ' + author.toString());
				});
				output.ruler2();
			}
			else {
				output.line('   ' + '<invalid info>');
				output.ruler2();
			}
		}
		else if (!skipNull) {
			output.line('   ' + '<no info>');
			output.ruler2();
		}
	}

	function printDependencies(file:tsd.DefVersion) {
		if (file.dependencies.length > 0) {

			tsd.DefUtil.mergeDependenciesOf(file.dependencies).filter((refer:tsd.DefVersion) => {
				return refer.def.path !== file.def.path;
			}).sort(tsd.DefUtil.fileCompare).forEach((refer:tsd.DefVersion) => {
				output.line(' - ' + refer.toString());

				if (refer.dependencies.length > 0) {
					refer.dependencies.sort(tsd.DefUtil.defCompare).forEach((refer:tsd.Def) => {
						output.line('    - ' + refer.path);
					});
				}
			});
			output.ruler2();

		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//very basic (async) init stuff
	function init(ctx:xm.ExposeContext):Q.Promise<void> {
		return loadPleonasm();
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//dry helpers: reuse / bundle init and arg parsing for query based commands

	var defaultJobOptions = [Opt.config];

	function jobOptions(merge:string[] = []):string[] {
		return defaultJobOptions.concat(merge);
	}

	//bundle some data
	class Job {
		api:tsd.API;
		context:tsd.Context;
		query:Query;
		options:Options;
	}

	//get a API with a Context and parse basic arguments
	function getAPIJob(ctx:xm.ExposeContext):Q.Promise<Job> {
		var d:Q.Deferred<Job> = Q.defer();

		// callback for easy error reporting
		init(ctx).then(() => {
			//verify valid path
			if (ctx.hasArg(Opt.config)) {
				return FS.isFile(ctx.getArg(Opt.config)).then((isFile:boolean) => {
					if (!isFile) {
						throw new Error('specified --config is not a file: ' + ctx.getArg(Opt.config));
					}
					return null;
				});
			}
			return null;
		}).then(() => {
			var job = new Job();
			job.context = getContext(ctx);
			job.api = new tsd.API(job.context);

			job.options = new tsd.Options();

			job.options.timeout = ctx.getArg(Opt.timeout);
			job.options.limitApi = ctx.getArg(Opt.limit);
			job.options.minMatches = ctx.getArg(Opt.min);
			job.options.maxMatches = ctx.getArg(Opt.max);

			job.options.saveToConfig = ctx.getArg(Opt.save);
			job.options.overwriteFiles = ctx.getArg(Opt.overwrite);
			job.options.resolveDependencies = ctx.getArg(Opt.resolve);

			var required:boolean = ctx.hasArg(Opt.config);

			return job.api.readConfig(!required).progress(d.notify).then(() => {
				d.resolve(job);
			});
		}).fail(d.reject);

		return d.promise;
	}

	function getSelectorJob(ctx:xm.ExposeContext):Q.Promise<Job> {
		var d:Q.Deferred<Job> = Q.defer();

		// callback for easy error reporting
		getAPIJob(ctx).progress(d.notify).then((job:Job) => {
			if (ctx.numArgs < 1) {
				throw new Error('pass at least one query pattern');
			}
			job.query = new Query();
			for (var i = 0, ii = ctx.numArgs; i < ii; i++) {
				job.query.addNamePattern(ctx.getArgAt(i));
			}
			job.query.commitSha = ctx.getArg(Opt.commit);

			if (ctx.hasArg(Opt.semver)) {
				job.query.versionMatcher = new tsd.VersionMatcher(ctx.getArg(Opt.semver));
			}
			if (ctx.hasArg(Opt.date)) {
				job.query.dateMatcher = new tsd.DateMatcher(ctx.getArg(Opt.date));
			}

			job.query.parseInfo = ctx.getArg(Opt.info);
			job.query.loadHistory = ctx.getArg(Opt.history);

			if (ctx.getArgAs(Opt.verbose, 'boolean')) {
				xm.log.inspect(job.query, 3, 'CLI job.query');
			}
			return job;
		}).then(d.resolve, d.reject);

		return d.promise;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function getExpose():xm.Expose {

		var expose = new xm.Expose('', output);

		function getProgress(ctx) {
			if (ctx.getArg(Opt.progress)) {
				return function (note) {
					reportProgress(note);
				};
			}
			return undefined;
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.before = (cmd:xm.ExposeCommand, ctx:xm.ExposeContext) => {
			return printPreviewNotice();
		};

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineGroup((group:xm.ExposeGroup) => {
			group.name = Group.query;
			group.label = 'Main commands';
			group.options = [Opt.config, Opt.cacheDir, Opt.min, Opt.max, Opt.limit];
			group.sorter = (one:xm.ExposeCommand, two:xm.ExposeCommand):number => {
				var sort:number;
				//TODO sane-ify sorting groups
				sort = xm.exposeSortHasElem(one.groups, two.groups, Group.query);
				if (sort !== 0) {
					return sort;
				}
				sort = xm.exposeSortHasElem(one.groups, two.groups, Group.support);
				if (sort !== 0) {
					return sort;
				}
				sort = xm.exposeSortHasElem(one.groups, two.groups, Group.help);
				if (sort !== 0) {
					return sort;
				}
				return xm.exposeSortIndex(one, two);
			};
		});

		expose.defineGroup((group:xm.ExposeGroup) => {
			group.name = Group.support;
			group.label = 'Support commands';
			group.options = [Opt.config, Opt.cacheDir];
		});

		expose.defineGroup((group:xm.ExposeGroup) => {
			group.name = Group.help;
			group.label = 'Help commands';
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// bulk add options
		tsd.cli.addOptions(expose);

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'version';
			cmd.label = 'Display version';
			cmd.groups = [Group.help];
			cmd.execute = ((ctx:xm.ExposeContext) => {
				return output.line(xm.PackageJSON.getLocal().version);
			});
		});

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'init';
			cmd.label = 'Create empty config file';
			cmd.options = [Opt.config, Opt.overwrite];
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getAPIJob(ctx).then((job:Job) => {
					return job.api.initConfig(ctx.getArg(Opt.overwrite)).progress(getProgress(ctx)).then((target:string) => {
						reportSucces(null);
						output.span(output.nibs.arrow).success('written ').span(target).clear();
					}, (err) => {
						output.span(output.nibs.arrow).error('error ').span(err.message).clear();
						throw(err);
					});
				}, reportError, getProgress(ctx));
			};
		});

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'settings';
			cmd.label = 'Display config settings';
			cmd.options = [Opt.config, Opt.cacheDir];
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getAPIJob(ctx).then((job:Job) => {
					return job.api.context.logInfo(true);

				}, reportError, getProgress(ctx));
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'query';
			cmd.label = 'Search definitions';
			cmd.variadic = ['pattern'];
			cmd.groups = [Group.primary, Group.query];
			cmd.options = [Opt.date, Opt.semver, Opt.commit,
				Opt.action, Opt.info, Opt.history, Opt.resolve];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getSelectorJob(ctx).then((job:Job) => {
					return job.api.select(job.query, job.options).progress(getProgress(ctx)).then((result:tsd.Selection) => {
						reportSucces(null);

						//TODO report on written/skipped
						result.selection.forEach((file:tsd.DefVersion) => {
							//printFile(file, true);
							printFileHead(file);
							printFileInfo(file, true);

							printDependencies(file);

							file.def.history.slice(0).forEach((file:tsd.DefVersion) => {
								printFileCommit(file);
							});
							output.line();
						});
					});
				}, reportError, getProgress(ctx));
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'reinstall';
			cmd.label = 'Re-install definitions from config';
			cmd.options = [Opt.overwrite];
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getAPIJob(ctx).then((job:Job) => {
					return job.api.reinstall(job.options).progress(getProgress(ctx)).then((result:tsd.InstallResult) => {
						reportSucces(null);

						//TODO report on written/skipped
						result.written.keys().sort().forEach((path:string) => {
							var file:tsd.DefVersion = result.written.get(path);
							output.line(file.toString());
							//output.line('    ' + path);
						});
					});
				}, reportError, getProgress(ctx));
			};
		});

		return expose;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	/*
	 runARGV: run raw cli arguments, like process.argv
	 */
	export function runARGV(argvRaw:any) {
		getExpose().executeArgv(argvRaw, 'help');
	}
}
