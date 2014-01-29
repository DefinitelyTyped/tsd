/// <reference path="_ref.ts" />
/// <reference path="../xm/Logger.ts" />
/// <reference path="../xm/expose/Expose.ts" />
/// <reference path="../xm/file.ts" />
/// <reference path="../xm/StyledOut.ts" />
/// <reference path="../xm/date.ts" />
/// <reference path="../xm/object.ts" />
/// <reference path="../xm/promise.ts" />
/// <reference path="../xm/encode.ts" />
/// <reference path="context/Context.ts" />
/// <reference path="select/Query.ts" />
/// <reference path="cli/printer.ts" />
/// <reference path="cli/update.ts" />
/// <reference path="cli/tracker.ts" />
/// <reference path="cli/style.ts" />
/// <reference path="cli/printer.ts" />
/// <reference path="cli/options.ts" />
/// <reference path="cli/const.ts" />

module tsd {
	'use strict';

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


	// bundle some data
	export class Job {
		ctx:xm.ExposeContext;
		api:tsd.API;
		context:tsd.Context;
		query:Query;
		options:Options;
	}

	// hah!
	export interface JobSelectionAction {
		(ctx:xm.ExposeContext, job:Job, selection:tsd.Selection):Q.Promise<any>;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// the fun starts here

	export function getExpose():xm.Expose {

		// late init

		var path = require('path');
		var Q = require('q');
		var FS = (<typeof QioFS> require('q-io/fs'));
		var yaml = require('js-yaml');

		var miniwrite = <typeof MiniWrite> require('miniwrite');
		var ministyle = <typeof MiniStyle> require('ministyle');

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		var Opt = tsd.cli.Opt;
		var Group = tsd.cli.Group;
		var Action = tsd.cli.Action;

		var output = new xm.StyledOut();
		var print = new tsd.cli.Printer(output);
		var styles = new tsd.cli.StyleMap(output);
		var tracker = new tsd.cli.Tracker();

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// very basic (async) init stuff
		function init(ctx:xm.ExposeContext):Q.Promise<void> {
			return Q.resolve();
		}
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		function showHeader():Q.Promise<void> {
			var pkg = xm.PackageJSON.getLocal();

			output.ln().report(true).tweakPunc(pkg.getNameVersion()).space().accent('(preview)').ln();
			// .clear().span(pkg.getHomepage(true)).ln()
			// .ruler().ln();
			return Q.resolve();
		}

		function runUpdateNotifier(ctx:xm.ExposeContext, context:tsd.Context):Q.Promise<any> {
			if (ctx.getOpt(Opt.services)) {
				return tsd.cli.runUpdateNotifier(context, false);
			}
			return Q.resolve();
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// TODO get rid of syncronous io
		function getContext(ctx:xm.ExposeContext):Q.Promise<tsd.Context> {
			xm.assertVar(ctx, xm.ExposeContext, 'ctx');

			var context = new tsd.Context(ctx.getOpt(Opt.config), ctx.getOpt(Opt.verbose));

			tracker.init(context, ctx.getOpt(Opt.services), ctx.getOpt(Opt.verbose));

			if (ctx.getOpt(Opt.dev)) {
				// TODO why not local?
				context.paths.cacheDir = path.resolve(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
			}
			else if (ctx.hasOpt(Opt.cacheDir)) {
				context.paths.cacheDir = path.resolve(ctx.getOpt(Opt.cacheDir));
			}
			else {
				context.paths.cacheDir = tsd.Paths.getUserCacheDir();
			}

			return Q.resolve(context);
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		var defaultJobOptions = [Opt.config];

		function jobOptions(merge:string[] = []):string[] {
			return defaultJobOptions.concat(merge);
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// get a API with a Context and parse basic arguments
		function getAPIJob(ctx:xm.ExposeContext):Q.Promise<Job> {
			var d:Q.Deferred<Job> = Q.defer();

			init(ctx).then(() => {
				/*// verify valid path
				if (ctx.hasOpt(Opt.config, true)) {
					return FS.isFile(ctx.getOpt(Opt.config)).then((isFile:boolean) => {
						if (!isFile) {
							throw new Error('specified --config is not a file: ' + ctx.getOpt(Opt.config));
						}
						return null;
					});
				}*/
				return null;
			}).then(() => {
				return getContext(ctx).then((context:tsd.Context) => {
					var job = new Job();
					job.context = context;

					job.ctx = ctx;
					job.api = new tsd.API(job.context);

					job.options = new tsd.Options();

					job.options.timeout = ctx.getOpt(Opt.timeout);
					job.options.limitApi = ctx.getOpt(Opt.limit);
					job.options.minMatches = ctx.getOpt(Opt.min);
					job.options.maxMatches = ctx.getOpt(Opt.max);

					job.options.saveToConfig = ctx.getOpt(Opt.save);
					job.options.overwriteFiles = ctx.getOpt(Opt.overwrite);
					job.options.resolveDependencies = ctx.getOpt(Opt.resolve);
					job.options.addToBundles = ctx.getOpt(Opt.bundle);

					if (ctx.hasOpt(Opt.cacheMode)) {
						job.api.core.useCacheMode(ctx.getOpt(Opt.cacheMode));
					}

					return job.api.readConfig(true).progress(d.notify).then(() => {
						return runUpdateNotifier(ctx, job.context);
					}).then(() => {
							d.resolve(job);
						});
				});
			}).fail(d.reject);

			return d.promise;
		}

		// get a API and parse selector options
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

				job.query.versionMatcher = new tsd.VersionMatcher(ctx.getOpt(Opt.semver));

				if (ctx.hasOpt(Opt.commit)) {
					job.query.commitMatcher = new tsd.CommitMatcher(ctx.getOpt(Opt.commit));
				}
				if (ctx.hasOpt(Opt.date)) {
					job.query.dateMatcher = new tsd.DateMatcher(ctx.getOpt(Opt.date));
				}

				job.query.parseInfo = ctx.getOpt(Opt.info);
				job.query.loadHistory = ctx.getOpt(Opt.history);

				if (ctx.getOptAs(Opt.verbose, 'boolean')) {
					output.span('CLI job.query').info().inspect(job.query, 3);
				}
				return job;
			}).then(d.resolve, d.reject);

			return d.promise;
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		var expose = new xm.Expose(output);

		function getProgress(ctx:xm.ExposeContext):(note:any) => void {
			if (ctx.getOpt(Opt.progress)) {
				return print.reportProgress;
			}
			return function (note:any) {
				// ignore
			};
		}

		function reportError(err:any, head:boolean = true):void {
			tracker.error(err);
			print.reportError(err, head);
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.before = (ctx:xm.ExposeContext) => {
			return showHeader();
		};

		expose.end = (ctx:xm.ExposeResult) => {
			if (!ctx.error) {
				return tsd.cli.showUpdateNotifier(output);
			}
			return null;
		};

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineGroup((group:xm.ExposeGroup) => {
			group.name = Group.query;
			group.label = 'main';
			group.options = [Opt.config, Opt.cacheDir, Opt.min, Opt.max, Opt.limit];
			group.sorter = (one:xm.ExposeCommand, two:xm.ExposeCommand):number => {
				var sort:number;
				// TODO sane-ify sorting groups
				sort = xm.exposeSortHasElem(one.groups, two.groups, Group.query);
				if (sort !== 0) {
					return sort;
				}
				return xm.exposeSortIndex(one, two);
			};
		});

		expose.defineGroup((group:xm.ExposeGroup) => {
			group.name = Group.support;
			group.label = 'support';
			group.options = [];
			group.sorter = (one:xm.ExposeCommand, two:xm.ExposeCommand):number => {
				var sort:number;
				// TODO sane-ify sorting groups
				sort = xm.exposeSortHasElem(one.groups, two.groups, Group.primary);
				if (sort !== 0) {
					return sort;
				}
				sort = xm.exposeSortHasElem(one.groups, two.groups, Group.support);
				if (sort !== 0) {
					return sort;
				}
				return xm.exposeSortIndex(one, two);
			};
		});

		expose.defineGroup((group:xm.ExposeGroup) => {
			group.name = Group.help;
			group.label = 'help';
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// bulk add boring commands and options
		tsd.cli.addCommon(expose, print, styles);

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'help';
			cmd.label = 'display usage help';
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getContext(ctx).then((context:tsd.Context) => {
					ctx.out.ln();
					ctx.expose.reporter.printCommands(ctx.getOpt(Opt.detail));

					return runUpdateNotifier(ctx, context);
				}).fail(reportError);
			};
		});

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'version';
			cmd.label = 'display tsd version info';
			cmd.groups = [Group.support];
			cmd.execute = ((ctx:xm.ExposeContext) => {
				return getContext(ctx).then((context:tsd.Context) => {
					ctx.out.ln();
					ctx.out.line(xm.PackageJSON.getLocal().getNameVersion());

					return runUpdateNotifier(ctx, context);
				}).fail(reportError);
			});
		});

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'init';
			cmd.label = 'create empty config file';
			cmd.options = [Opt.config, Opt.overwrite];
			cmd.groups = [Group.support, Group.primary];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getAPIJob(ctx).progress(notify).then((job:Job) => {
					return job.api.initConfig(ctx.getOpt(Opt.overwrite)).progress(notify).then((target:string) => {
						output.ln().info().success('written').sp().span(target).ln();
					}, (err) => {
						output.ln().info().error('error').sp().span(err.message).ln();
						throw(err);
					});
				}).fail(reportError);
			};
		});

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'settings';
			cmd.label = 'display config settings';
			cmd.options = [Opt.config, Opt.cacheDir];
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getAPIJob(ctx).progress(notify).then((job:Job) => {
					output.ln();
					var opts = {
						indent: 3,
						flowLevel: -1
					};
					return output.plain(yaml.safeDump(job.api.context.getInfo(true)));

				}).fail(reportError);
			};
		});

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'purge';
			cmd.label = 'clear local caches';
			cmd.options = [Opt.cacheDir];
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getAPIJob(ctx).progress(notify).then((job:Job) => {
					// TODO expose raw/api/all option
					return job.api.purge(true, true).progress(notify).then(() => {

					});
				}).fail(reportError);
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// TODO abstractify ActionMap / JobSelectionAction into Expose
		var queryActions = new xm.ActionMap<tsd.JobSelectionAction>();
		queryActions.set(Action.install, function (ctx:xm.ExposeContext, job:Job, selection:tsd.Selection) {
			return job.api.install(selection, job.options).then((result:tsd.InstallResult) => {
				print.installResult(result);

				tracker.install('install', result);
			});
		});
		queryActions.set(Action.browse, function (ctx:xm.ExposeContext, job:Job, selection:tsd.Selection) {
			return job.api.browse(selection).then((opened:string[]) => {
				if (opened.length > 0) {
					print.output.ln();
					opened.forEach((url:string) => {
						print.output.note(true).line(url);
						tracker.browser(url);
					});
				}
			});
		});

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'query';
			cmd.label = 'search definitions using globbing pattern';
			cmd.examples = [
				['tsd query d3 --info -history', 'view d3 info & history'],
				['tsd query mocha --action install', 'install mocha'],
				['tsd query jquery.*/*', 'search jquery plugins'],
				['tsd query angular* --resolve', 'list angularjs bundle']
			];
			cmd.variadic = ['pattern'];
			cmd.groups = [Group.primary, Group.query];
			cmd.options = [
				Opt.info, Opt.history,
				Opt.semver, Opt.date, Opt.commit,
				Opt.action,
				Opt.resolve, Opt.overwrite, Opt.save, Opt.bundle
			];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getSelectorJob(ctx).then((job:Job) => {
					tracker.query(job.query);

					return job.api.select(job.query, job.options).progress(notify).then((selection:tsd.Selection) => {

						if (selection.selection.length === 0) {
							output.ln().report().warning('zero results').ln();
							return;
						}
						output.line();

						// TODO report on written/skipped
						selection.selection.sort(tsd.DefUtil.fileCompare).forEach((file:tsd.DefVersion, i:number) => {
							// printFile(file, true);
							print.fileHead(file);
							print.fileInfo(file, true);
							print.dependencies(file);
							print.history(file);

							output.cond(i < selection.selection.length - 1, '\n');
						});

						// run actions
						return Q().then(() => {
							// get as arg
							var action = ctx.getOpt(Opt.action);
							if (!action) {
								// output.ln().report().warning('no action').ln();
								return;
							}
							if (!queryActions.has(action)) {
								output.ln().report().warning('unknown action:').space().span(action).ln();
								return;
							}
							output.ln().report(true).span('running').space().accent(action).span('..').ln();

							return queryActions.run(action, (run:tsd.JobSelectionAction) => {
								return run(ctx, job, selection);

							}, true).progress(notify).fail((err) => {
									output.report().span(action).space().error('error!').ln();
									reportError(err, false);
								});
						});
					});
				}).fail(reportError);
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'reinstall';
			cmd.label = 're-install definitions from config';
			cmd.options = [Opt.overwrite, Opt.save];
			cmd.groups = [Group.support, Group.primary];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getAPIJob(ctx).progress(notify).then((job:Job) => {
					output.line();
					output.info(true).span('running').space().accent(cmd.name).ln();

					return job.api.reinstall(job.options).progress(notify).then((result:tsd.InstallResult) => {
						print.installResult(result);

						tracker.install('reinstall', result);
					});
				}).fail(reportError);
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'update';
			cmd.label = 'update definitions from config';
			cmd.options = [Opt.overwrite, Opt.save];
			cmd.groups = [Group.support, Group.primary];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getAPIJob(ctx).progress(notify).then((job:Job) => {
					output.line();
					output.info(true).span('running').space().accent(cmd.name).ln();

					return job.api.update(job.options).progress(notify).then((result:tsd.InstallResult) => {
						print.installResult(result);

						tracker.install('update', result);
					});
				}).fail(reportError);
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'rate';
			cmd.label = 'check github rate-limit';
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getAPIJob(ctx).progress(notify).then((job:Job) => {
					return job.api.getRateInfo().progress(notify).then((info:git.GitRateInfo) => {
						print.rateInfo(info);
					});
				}).fail(reportError);
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'validate';
			cmd.label = 'validate data source';
			cmd.hidden = true;
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getContext(ctx).then((context:tsd.Context) => {
					var job = new Job();
					job.context = context;

					job.ctx = ctx;
					job.api = new tsd.API(job.context);

					job.query = new tsd.Query('*');
					job.query.parseInfo = true;

					job.options = new tsd.Options();
					job.options.resolveDependencies = true;

					if (ctx.hasOpt(Opt.cacheMode)) {
						job.api.core.useCacheMode(ctx.getOpt(Opt.cacheMode));
					}

					return job.api.readConfig(true).progress(notify).then(() => {
						return job.api.select(job.query, job.options).progress(notify).then((selection:tsd.Selection) => {
							if (selection.selection.length === 0) {
								output.ln().report().warning('zero results').ln();
								return;
							}

							var invalid = [];
							selection.selection.forEach((def:tsd.DefVersion) => {
								if (!def.commit || !def.info) {
									invalid.push(def);
									return;
								}
								if (!def.info.name || !def.info.projectUrl || def.info.authors.length === 0) {
									invalid.push(def);
									return;
								}
							});
							if (invalid.length > 0) {
								output.line();
								output.info(true).span('found').space().error(invalid.length).space().span('invalid defs').ln();
								output.inspect(invalid, 3);
							}
						});
					});
				}).fail(reportError);
			};
		});

		return expose;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

	/*
	 runARGV: run raw cli arguments, like process.argv
	 */
	export function runARGV(argvRaw:any) {
		getExpose().executeArgv(argvRaw, 'help');
	}
}
