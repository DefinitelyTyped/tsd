///<reference path="_ref.ts" />
///<reference path="../xm/Logger.ts" />
///<reference path="../xm/expose/Expose.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/io/StyledOut.ts" />
///<reference path="../xm/DateUtil.ts" />
///<reference path="../xm/ObjectUtil.ts" />
///<reference path="../xm/promise.ts" />
///<reference path="cli/printer.ts" />
///<reference path="context/Context.ts" />
///<reference path="select/Query.ts" />
///<reference path="cli/style.ts" />
///<reference path="cli/printer.ts" />
///<reference path="cli/options.ts" />
///<reference path="cli/const.ts" />

module tsd {
	'use strict';

	var path = require('path');
	var Q = require('q');
	var FS = (<typeof QioFS> require('q-io/fs'));

	var miniwrite = <typeof MiniWrite> require('miniwrite');
	var ministyle = <typeof MiniStyle> require('ministyle');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

	var Opt = tsd.cli.Opt;
	var Group = tsd.cli.Group;
	var Action = tsd.cli.Action;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var output = new xm.StyledOut();
	var print = new tsd.cli.Printer(output);
	var styles = new tsd.cli.StyleMap(output);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

	function showHeader():Q.Promise<void> {
		var pkg = xm.PackageJSON.getLocal();

		output.ln().report(true).tweakPunc(pkg.getNameVersion()).space().accent('(preview)').ln();
		//.clear().span(pkg.getHomepage(true)).ln()
		//.ruler().ln();
		//TODO implement version check / news service
		return Q.resolve();
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function getContext(ctx:xm.ExposeContext):tsd.Context {
		xm.assertVar(ctx, xm.ExposeContext, 'ctx');

		var context = new tsd.Context(ctx.getOpt(Opt.config), ctx.getOpt(Opt.verbose));

		if (ctx.getOpt(Opt.dev)) {
			context.paths.cacheDir = path.resolve(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
		}
		else if (ctx.hasOpt(Opt.cacheDir)) {
			context.paths.cacheDir = path.resolve(ctx.getOpt(Opt.cacheDir));
		}
		else {
			context.paths.cacheDir = tsd.Paths.getUserCacheDir();
		}
		return context;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

	//very basic (async) init stuff
	function init(ctx:xm.ExposeContext):Q.Promise<void> {
		return Q.resolve();
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

	//dry helpers: reuse / bundle init and arg parsing for query based commands

	var defaultJobOptions = [Opt.config];

	function jobOptions(merge:string[] = []):string[] {
		return defaultJobOptions.concat(merge);
	}

	//bundle some data
	export class Job {
		api:tsd.API;
		context:tsd.Context;
		query:Query;
		options:Options;
	}

	//hah!
	export interface JobSelectionAction {
		(ctx:xm.ExposeContext, job:Job, selection:tsd.Selection):Q.Promise<any>;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//get a API with a Context and parse basic arguments
	function getAPIJob(ctx:xm.ExposeContext):Q.Promise<Job> {
		var d:Q.Deferred<Job> = Q.defer();

		init(ctx).then(() => {
			//verify valid path
			if (ctx.hasOpt(Opt.config, true)) {
				return FS.isFile(ctx.getOpt(Opt.config)).then((isFile:boolean) => {
					if (!isFile) {
						throw new Error('specified --config is not a file: ' + ctx.getOpt(Opt.config));
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

			job.options.timeout = ctx.getOpt(Opt.timeout);
			job.options.limitApi = ctx.getOpt(Opt.limit);
			job.options.minMatches = ctx.getOpt(Opt.min);
			job.options.maxMatches = ctx.getOpt(Opt.max);

			job.options.saveToConfig = ctx.getOpt(Opt.save);
			job.options.overwriteFiles = ctx.getOpt(Opt.overwrite);
			job.options.resolveDependencies = ctx.getOpt(Opt.resolve);

			var required:boolean = ctx.hasOpt(Opt.config);

			return job.api.readConfig(!required).progress(d.notify).then(() => {
				d.resolve(job);
			});
		}).fail(d.reject);

		return d.promise;
	}

	//get a API and parse selector options
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

			if (ctx.hasOpt(Opt.commit)) {
				job.query.commitMatcher = new tsd.CommitMatcher(ctx.getOpt(Opt.commit));
			}
			if (ctx.hasOpt(Opt.semver)) {
				job.query.versionMatcher = new tsd.VersionMatcher(ctx.getOpt(Opt.semver));
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

	function reportError(err:any, head:boolean = true):xm.StyledOut {
		if (head) {
			output.ln().info().error('an error occured!').clear();
		}

		if (err.stack) {
			return output.block(err.stack);
		}
		return output.line(err);
	}

	function reportProgress(obj:any):xm.StyledOut {
		if (obj instanceof git.GitRateInfo) {
			return print.rateInfo(obj);
		}
		return output.indent().note(true).label(xm.typeOf(obj)).inspect(obj, 3);
	}

	function reportSucces(result:tsd.APIResult):xm.StyledOut {
		//this.output.ln().info().success('success!').clear();
		if (result) {
			result.selection.forEach((def:tsd.DefVersion) => {
				this.output.line(def.toString());
				if (def.info) {
					output.line(def.info.toString());
					output.line(def.info);
				}
			});
		}
		return output;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

	// the fun starts here

	export function getExpose():xm.Expose {
		var expose = new xm.Expose(output);

		function getProgress(ctx) {
			if (ctx.getOpt(Opt.progress)) {
				return function (note) {
					reportProgress(note);
				};
			}
			return function (note) {
				// ignore
			};
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.before = (ctx:xm.ExposeContext) => {
			return Q.all([
				showHeader()
			]);
		};

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineGroup((group:xm.ExposeGroup) => {
			group.name = Group.query;
			group.label = 'main';
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
			group.label = 'support';
			group.options = [];
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
			cmd.name = 'init';
			cmd.label = 'create empty config file';
			cmd.options = [Opt.config, Opt.overwrite];
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getAPIJob(ctx).then((job:Job) => {
					return job.api.initConfig(ctx.getOpt(Opt.overwrite)).progress(notify).then((target:string) => {
						output.ln().info().success('written').sp().span(target).ln();
					}, (err) => {
						output.ln().info().error('error').sp().span(err.message).ln();
						throw(err);
					});
				}, reportError);
			};
		});

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'settings';
			cmd.label = 'display config settings';
			cmd.options = [Opt.config, Opt.cacheDir];
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getAPIJob(ctx).then((job:Job) => {
					output.ln();
					return <any> job.api.context.logInfo(true);

				}, reportError);
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		//TODO abstractify this
		var queryActions = new xm.ActionMap<tsd.JobSelectionAction>();
		queryActions.set(Action.install, function (ctx:xm.ExposeContext, job:Job, selection:tsd.Selection) {
			return job.api.install(selection, job.options).then((result:tsd.InstallResult) => {
				print.installResult(result);
			});
		});
		/*queryActions.set(Action.open, (ctx:xm.ExposeContext, job:Job, selection:tsd.Selection) => {
		 return job.api.install(selection);
		 });*/

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'query';
			cmd.label = 'search definitions using globbing pattern';
			cmd.variadic = ['pattern'];
			cmd.groups = [Group.primary, Group.query];
			cmd.options = [
				Opt.info, Opt.history,
				Opt.semver, Opt.date, Opt.commit,
				Opt.action,
				Opt.resolve, Opt.overwrite, Opt.save
			];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getSelectorJob(ctx).then((job:Job) => {
					return job.api.select(job.query, job.options).progress(notify).then((selection:tsd.Selection) => {
						if (selection.selection.length === 0) {
							output.ln().report().warning('zero results').ln();
							return;
						}
						output.line();

						//TODO report on written/skipped
						selection.selection.sort(tsd.DefUtil.fileCompare).forEach((file:tsd.DefVersion, i:number) => {
							//printFile(file, true);
							print.fileHead(file);
							print.fileInfo(file, true);
							print.dependencies(file);
							print.history(file);

							output.cond(i < selection.selection.length - 1, '\n');
						});

						//run actions
						return Q().then(() => {
							//get as arg
							var action = ctx.getOpt(Opt.action);
							if (!action) {
								//output.ln().report().warning('no action').ln();
								return;
							}
							if (!queryActions.has(action)) {
								output.ln().report().warning('unknown action:').space().span(action).ln();
								return;
							}
							output.ln().report(true).span('running').space().accent(action).span('..').ln();

							return queryActions.run(action, (run:tsd.JobSelectionAction) => {
								return run(ctx, job, selection);
							}, true).then(() => {
								//whut?
							}, (err) => {
								output.report().span(action).space().error('error!').ln();
								reportError(err, false);
							}, notify);
						});
					});
				}, reportError);
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'reinstall';
			cmd.label = 're-install definitions from config';
			cmd.options = [Opt.overwrite, Opt.config, Opt.cacheDir];
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getAPIJob(ctx).then((job:Job) => {
					output.line();
					output.info(true).span('running').space().accent(cmd.name).ln();

					return job.api.reinstall(job.options).progress(notify).then((result:tsd.InstallResult) => {
						print.installResult(result);
					});
				}, reportError);
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.defineCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'rate';
			cmd.label = 'check github rate-limit';
			cmd.groups = [Group.support];
			cmd.execute = (ctx:xm.ExposeContext) => {
				var notify = getProgress(ctx);
				return getAPIJob(ctx).then((job:Job) => {
					return job.api.getRateInfo().progress(notify).then((info:git.GitRateInfo) => {
						print.rateInfo(info);
					});
				}, reportError);
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
