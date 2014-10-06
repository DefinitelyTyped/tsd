/// <reference path="./_ref.d.ts" />

'use strict';

import path = require('path');

import Promise = require('bluebird');
import VError = require('verror');

import miniwrite = require('miniwrite');
import ministyle = require('ministyle');

import fileIO = require('../xm/fileIO');
import assertVar = require('../xm/assertVar');
import dateUtils = require('../xm/dateUtils');
import stringUtils = require('../xm/stringUtils');
import PackageJSON = require('../xm/lib/PackageJSON');
import StyledOut = require('../xm/lib/StyledOut');

import ActionMap = require('../xm/lib/ActionMap');
import GithubRateInfo = require('../git/model/GithubRateInfo');

import API = require('./API');
import Options = require('./Options');
import Context = require('./context/Context');
import Const = require('./context/Const');
import Paths = require('./context/Paths');

import DefVersion = require('./data/DefVersion');
import defUtil = require('./util/defUtil');

import Query = require('./select/Query');
import Selection = require('./select/Selection');
import VersionMatcher = require('./select/VersionMatcher');
import CommitMatcher = require('./select/CommitMatcher');
import DateMatcher = require('./select/DateMatcher');
import InstallResult = require('./logic/InstallResult');

import PackageDefinition = require('./support/PackageDefinition');
import BundleChange = require('./support/BundleChange');

import Expose = require('../expose/Expose');
import ExposeGroup = require('../expose/Group');
import ExposeOption = require('../expose/Option');
import ExposeResult = require('../expose/Result');
import ExposeCommand = require('../expose/Command');
import ExposeContext = require('../expose/Context');
import sorter = require('../expose/sorter');

import CliConst = require('./cli/const');
import Opt = CliConst.Opt;
import Group = CliConst.Group;
import Action = CliConst.Action;

import Printer = require('./cli/CLIPrinter');
import TablePrinter = require('./cli/TablePrinter');
import StyleMap = require('./cli/StyleMap');
import Tracker = require('./cli/tracker');
import addCommon = require('./cli/addCommon');

import update = require('./cli/update');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// bundle some data
export class Job {
	ctx: ExposeContext;
	api: API;
	context: Context;
	query: Query;
	options: Options;
}

// hah!
export interface JobSelectionAction {
	(ctx: ExposeContext, job: Job, selection: Selection):Promise<any>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// the fun starts here

export function getExpose(): Expose {

	var output = new StyledOut();
	if (!process.stdout['isTTY']) {
		output.useStyle(ministyle.plain());
	}

	var print = new Printer(output);
	var table = new TablePrinter(output);
	var styles = new StyleMap(output);
	var tracker = new Tracker();

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// very basic (async) init stuff
	function init(ctx: ExposeContext): Promise<void> {
		return Promise.resolve();
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function showHeader(): Promise<void> {
		var pkg = PackageJSON.getLocal();

		output.ln().report(true).tweakPunc(pkg.getNameVersion()).ln(); // .space().muted('(').accent('beta').muted(')').ln();
		// .clear().span(pkg.getHomepage(true)).ln()
		// .ruler().ln();
		return Promise.resolve();
	}

	function runUpdateNotifier(ctx: ExposeContext, context: Context): Promise<any> {
		if (ctx.getOpt(Opt.services)) {
			return update.runNotifier(context, false);
		}
		return Promise.resolve();
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// TODO get rid of syncronous io
	function getContext(ctx: ExposeContext): Promise<Context> {
		assertVar(ctx, ExposeContext, 'ctx');

		var context = new Context(ctx.getOpt(Opt.config), ctx.getOpt(Opt.verbose));

		tracker.init(context, (ctx.getOpt(Opt.services) && context.config.stats), ctx.getOpt(Opt.verbose));

		if (ctx.getOpt(Opt.dev)) {
			// TODO why not local?
			context.paths.cacheDir = path.resolve(path.dirname(PackageJSON.find()), Const.cacheDir);
		}
		else if (ctx.hasOpt(Opt.cacheDir)) {
			context.paths.cacheDir = path.resolve(ctx.getOpt(Opt.cacheDir));
		}
		else if (!context.paths.cacheDir) {
			context.paths.cacheDir = Paths.getUserCacheDir();
		}

		return Promise.resolve(context);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var defaultJobOptions = [Opt.config];

	function jobOptions(merge: string[] = []): string[] {
		return defaultJobOptions.concat(merge);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// get a API with a Context and parse basic arguments
	function getAPIJob(ctx: ExposeContext): Promise<Job> {
		return init(ctx).then(() => {
			return getContext(ctx).then((context: Context) => {
				var job = new Job();
				job.context = context;

				job.ctx = ctx;
				job.api = new API(job.context);

				job.options = new Options();

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

				return job.api.readConfig(true).then(() => {
					tracker.enabled = (tracker.enabled && job.context.config.stats);

					return runUpdateNotifier(ctx, job.context);
				}).return(job);
			});
		});
	}

	// get a API and parse selector options
	function getSelectorJob(ctx: ExposeContext): Promise<Job> {
		// callback for easy error reporting
		return getAPIJob(ctx).then((job: Job) => {
			if (ctx.numArgs < 1) {
				throw new VError('pass at least one query pattern');
			}
			job.query = new Query();
			for (var i = 0, ii = ctx.numArgs; i < ii; i++) {
				job.query.addNamePattern(ctx.getArgAt(i));
			}

			job.query.versionMatcher = new VersionMatcher(ctx.getOpt(Opt.semver));

			if (ctx.hasOpt(Opt.commit)) {
				job.query.commitMatcher = new CommitMatcher(ctx.getOpt(Opt.commit));
			}
			if (ctx.hasOpt(Opt.date)) {
				job.query.dateMatcher = new DateMatcher(ctx.getOpt(Opt.date));
			}

			job.query.parseInfo = ctx.getOpt(Opt.info);
			job.query.loadHistory = ctx.getOpt(Opt.history);

			if (ctx.getOptAs(Opt.verbose, 'boolean')) {
				output.span('CLI job.query').info().inspect(job.query, 3);
			}
			return job;
		});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var expose = new Expose(output);

	function reportError(err: any, head: boolean = true): void {
		tracker.error(err);
		print.reportError(err, head);
	}

	function link(job: Job): Promise<PackageDefinition[]> {
		return job.api.link(job.api.context.paths.startCwd).then((packages: PackageDefinition[]) => {
			if (packages.length > 0) {
				packages.forEach((linked) => {
					tracker.link(linked.name + ' (' + linked.manager + ')');
					output.indent(1).report(true).line(linked.name + ' (' + linked.manager + ')');
				});
			}
			return packages;
		});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	expose.before = (ctx: ExposeContext) => {
		return null; // showHeader();
	};

	expose.end = (ctx: ExposeResult) => {
		if (!ctx.error) {
			return update.showNotifier(output);
		}
		return null;
	};

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	expose.defineGroup((group: ExposeGroup) => {
		group.name = Group.query;
		group.label = 'main';
		group.options = [Opt.config, Opt.cacheDir, Opt.min, Opt.max, Opt.limit];
		group.sorter = (one: ExposeCommand, two: ExposeCommand): number => {
			var sort: number;
			// TODO sane-ify sorting groups
			sort = sorter.sortHasElem(one.groups, two.groups, Group.query);
			if (sort !== 0) {
				return sort;
			}
			return sorter.sortCommandIndex(one, two);
		};
	});

	expose.defineGroup((group: ExposeGroup) => {
		group.name = Group.manage;
		group.label = 'manage';
		group.options = [];
		group.sorter = (one: ExposeCommand, two: ExposeCommand): number => {
			var sort: number;
			// TODO sane-ify sorting groups
			sort = sorter.sortHasElem(one.groups, two.groups, Group.manage);
			if (sort !== 0) {
				return sort;
			}
			return sorter.sortCommandIndex(one, two);
		};
	});

	expose.defineGroup((group: ExposeGroup) => {
		group.name = Group.support;
		group.label = 'support';
		group.options = [];
		group.sorter = (one: ExposeCommand, two: ExposeCommand): number => {
			var sort: number;
			// TODO sane-ify sorting groups
			sort = sorter.sortHasElem(one.groups, two.groups, Group.support);
			if (sort !== 0) {
				return sort;
			}
			return sorter.sortCommandIndex(one, two);
		};
	});

	expose.defineGroup((group: ExposeGroup) => {
		group.name = Group.help;
		group.label = 'help';
	});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// bulk add boring commands and options
	addCommon(expose, print, styles);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'help';
		cmd.label = 'display usage help';
		cmd.groups = [Group.support];
		cmd.execute = (ctx: ExposeContext) => {
			return showHeader().then(() => {
				return getContext(ctx);
			}).then((context: Context) => {
				ctx.out.ln();
				ctx.expose.reporter.printCommands();

				return runUpdateNotifier(ctx, context);
			}).catch(reportError);
		};
	});

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'version';
		cmd.label = 'display tsd version info';
		cmd.groups = [Group.support];
		cmd.execute = (ctx: ExposeContext) => {
			return showHeader().then(() => {
				return getContext(ctx);
			}).then((context: Context) => {
				return runUpdateNotifier(ctx, context);
			}).catch(reportError);
		};
	});

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'init';
		cmd.label = 'create empty config file';
		cmd.options = [Opt.config, Opt.overwrite];
		cmd.groups = [Group.support];
		cmd.execute = (ctx: ExposeContext) => {
			return getAPIJob(ctx).then((job: Job) => {
				return job.api.initConfig(ctx.getOpt(Opt.overwrite)).then((target: string) => {
					output.ln().info().success('written').sp().span(target).ln();
				}, (err) => {
					output.ln().info().error('error').sp().span(err.message).ln();
					throw(err);
				});
			}).catch(reportError);
		};
	});

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'settings';
		cmd.label = 'display config settings';
		cmd.options = [Opt.config, Opt.cacheDir];
		cmd.groups = [Group.support];
		cmd.execute = (ctx: ExposeContext) => {
			return getAPIJob(ctx).then((job: Job) => {
				output.ln().plain(JSON.stringify(job.api.context.getInfo(true), null, 3));
			}).catch(reportError);
		};
	});

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'purge';
		cmd.label = 'clear local caches';
		cmd.options = [Opt.cacheDir];
		cmd.groups = [Group.support];
		cmd.execute = (ctx: ExposeContext) => {
			return getAPIJob(ctx).then((job: Job) => {
				// TODO expose raw/api/all option
				return job.api.purge(true, true).then(() => {
					output.ln().info().success('purged cache').ln();
				});
			}).catch(reportError);
		};
	});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// TODO abstractify ActionMap / JobSelectionAction into Expose
	var queryActions = new ActionMap<JobSelectionAction>();
	queryActions.set(Action.install, function (ctx: ExposeContext, job: Job, selection: Selection) {
		return job.api.install(selection, job.options).then((result: InstallResult) => {
			print.installResult(result);

			tracker.install('install', result);
		});
	});
	queryActions.set(Action.browse, function (ctx: ExposeContext, job: Job, selection: Selection) {
		return job.api.browse(selection.selection).then((opened: string[]) => {
			if (opened.length > 0) {
				print.output.ln();
				opened.forEach((url: string) => {
					print.output.note(true).line(url);
					tracker.browser(url);
				});
			}
		});
	});
	queryActions.set(Action.visit, function (ctx: ExposeContext, job: Job, selection: Selection) {
		return job.api.visit(selection.selection).then((opened: string[]) => {
			if (opened.length > 0) {
				print.output.ln();
				opened.forEach((url: string) => {
					print.output.note(true).line(url);
					tracker.visit(url);
				});
			}
		});
	});

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'install';
		cmd.label = 'install definitions using one or more globbing patterns';
		cmd.examples = [
			['tsd install mocha', 'install mocha'],
			['tsd install angularjs/', 'install full angularjs bundle']
		];
		cmd.variadic = ['...pattern'];
		cmd.groups = [Group.query];
		cmd.options = [
			Opt.semver, Opt.date, Opt.commit,
			Opt.resolve, Opt.overwrite, Opt.save, Opt.bundle
		];
		cmd.execute = (ctx: ExposeContext) => {
			return getSelectorJob(ctx).then((job: Job) => {
				tracker.query(job.query);

				return job.api.select(job.query, job.options).then((selection: Selection) => {

					if (selection.selection.length === 0) {
						output.ln().report().signal('zero results').ln();
						return;
					}
					output.line();

					table.fileTable(selection.selection);

					output.ln().report(true).span('running').space().accent('install').span('..').ln();

					return job.api.install(selection, job.options).then((result: InstallResult) => {
						print.installResult(result);

						tracker.install('install', result);
					}).catch((err) => {
						output.report().span('install').space().error('error!').ln();
						reportError(err, false);
					});
				});
			}).catch(reportError);
		};
	});

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'query';
		cmd.label = 'search definitions using one or more globbing patterns';
		cmd.examples = [
			['tsd query d3 --info --history', 'view d3 info & history'],
			['tsd query mocha --action install', 'install mocha'],
			['tsd query jquery.*/*', 'search jquery plugins'],
			['tsd query angularjs/ --resolve', 'list full angularjs bundle']
		];
		cmd.variadic = ['...pattern'];
		cmd.groups = [Group.query];
		cmd.options = [
			Opt.info, Opt.history,
			Opt.semver, Opt.date, Opt.commit,
			Opt.action,
			Opt.resolve, Opt.overwrite, Opt.save, Opt.bundle
		];
		cmd.execute = (ctx: ExposeContext) => {
			return getSelectorJob(ctx).then((job: Job) => {
				tracker.query(job.query);

				return job.api.select(job.query, job.options).then((selection: Selection) => {

					if (selection.selection.length === 0) {
						output.ln().report().signal('zero results').ln();
						return;
					}
					output.line();

					table.fileTable(selection.selection);

					// run actions
					return Promise.attempt(() => {
						// get as arg
						var action = ctx.getOpt(Opt.action);
						if (!action) {
							// output.ln().report().warning('no action').ln();
							return;
						}
						if (!queryActions.has(action)) {
							output.ln().report().signal('unknown action:').space().span(action).ln();
							return;
						}
						output.ln().report(true).span('running').space().accent(action).span('..').ln();

						return queryActions.run(action, (run: JobSelectionAction) => {
							return run(ctx, job, selection);

						}, true).catch((err) => {
							output.report().span(action).space().error('error!').ln();
							reportError(err, false);
						});
					});
				});
			}).catch(reportError);
		};
	});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'reinstall';
		cmd.label = 're-install definitions from config';
		cmd.options = [Opt.overwrite, Opt.save];
		cmd.groups = [Group.manage];
		cmd.execute = (ctx: ExposeContext) => {
			return getAPIJob(ctx).then((job: Job) => {
				output.line();
				output.info(true).span('running').space().accent(cmd.name).ln();

				return job.api.reinstall(job.options).then((result: InstallResult) => {
					print.installResult(result);

					tracker.install('reinstall', result);
				}).then(() => {
					return link(job);
				});
			}).catch(reportError);
		};
	});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'update';
		cmd.label = 'update definitions from config';
		cmd.options = [Opt.overwrite, Opt.save];
		cmd.groups = [Group.manage];
		cmd.execute = (ctx: ExposeContext) => {
			return getAPIJob(ctx).then((job: Job) => {
				output.line();
				output.info(true).span('running').space().accent(cmd.name).ln();

				return job.api.update(job.options).then((result: InstallResult) => {
					print.installResult(result);

					tracker.install('update', result);
				});
			}).catch(reportError);
		};
	});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'rebundle';
		cmd.label = 'update & clean reference bundle';
		cmd.groups = [Group.manage];
		cmd.execute = (ctx: ExposeContext) => {
			return getAPIJob(ctx).then((job: Job) => {
				return Promise.attempt(() => {
					if (!job.api.context.config.bundle) {
						output.line();
						output.report(true).line('no bundle configured').ln();
						return null;
					}

					output.line();
					// output.info(true).span('running').space().accent(cmd.name).ln();

					return job.api.updateBundle(job.api.context.config.bundle, true).then((changes) => {
						if (changes.someRemoved()) {
							output.report(true).line('removed:');
							changes.getRemoved(true, true).sort().forEach((file) => {
								output.indent(1).bullet(true).tweakPath(file).ln();
							});
						}
						if (changes.someAdded()) {
							output.report(true).line('added:');
							changes.getAdded(true, true).sort().forEach((file) => {
								output.indent(1).bullet(true).tweakPath(file).ln();
							});
						}
						if (!changes.someAdded() && !changes.someRemoved()) {
							output.report(true).span('nothing rebundled').ln();
						}
					});
				});
			}).catch(reportError);
		};
	});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'link';
		cmd.label = 'link definitions from package managers';
		cmd.groups = [Group.manage];
		cmd.execute = (ctx: ExposeContext) => {
			return getAPIJob(ctx).then((job: Job) => {
				output.line();
				// output.info(true).span('running').space().accent(cmd.name).ln().ln();
				return link(job).then((packages) => {
					if (packages.length === 0) {
						output.report(true).line('no (new) packages to link');
					}
				});
			}).catch(reportError);
		};
	});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	expose.defineCommand((cmd: ExposeCommand) => {
		cmd.name = 'rate';
		cmd.label = 'check github rate-limit';
		cmd.groups = [Group.support];
		cmd.execute = (ctx: ExposeContext) => {
			return getAPIJob(ctx).then((job: Job) => {
				return job.api.getRateInfo().then((info: GithubRateInfo) => {
					print.rateInfo(info, false, true);
				});
			}).catch(reportError);
		};
	});

	return expose;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/*
 runARGV: run raw cli arguments, like process.argv
 */
export function runARGV(argvRaw: any) {
	getExpose().executeArgv(argvRaw, 'help');
}
