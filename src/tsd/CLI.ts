///<reference path="_ref.ts" />
///<reference path="../xm/Logger.ts" />
///<reference path="../xm/io/Expose.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/io/StyledOut.ts" />
///<reference path="../xm/DateUtil.ts" />
///<reference path="context/Context.ts" />

module tsd {
	'use strict';

	var path = require('path');
	var Q:typeof Q = require('q');
	var FS:typeof QioFS = require('q-io/fs');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var output = new xm.StyledOut();

	var styleMap = new xm.KeyValueMap<(ctx: xm.ExposeContext) => void>();

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

	function useColor(color:string, ctx:xm.ExposeContext) {
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

		var context = new tsd.Context(ctx.getArg('config'), ctx.getArg('verbose'));

		if (ctx.getArg('dev')) {
			context.paths.cacheDir = path.resolve(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
		}
		else if (ctx.hasArg('cacheDir')) {
			context.paths.cacheDir = path.resolve(ctx.getArg('cacheDir'));
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
		output.accent('progress').space().inspect(obj, 3);
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

	function printSubHead(text:string) {
		output.line(' ' + text);
		output.ruler2();
	}

	function printDefHead(def:tsd.Def) {
		output.line(def.toString() + ' ' + pleo(def.head.blob.shaShort));
		output.ruler2();
	}

	function printFileHead(file:tsd.DefVersion) {
		printFile(file);
		output.ruler2();
	}

	function printFile(file:tsd.DefVersion) {
		var str = '';
		str += (file.def ? file.def.path : '<no def>');
		str += '  :  ' + (file.commit ? file.commit.commitShort : '<no commit>');
		str += '  :  ' + (file.blob ? file.blob.shaShort : '<no blob>');
		output.line(str);
	}

	function printFileCommit(file:tsd.DefVersion, skipNull:boolean = false) {
		if (file.commit) {
			var line = '   ' + file.commit.commitShort;

			line += '  |  ' + file.blobShaShort;

			line += '  |  ' + xm.DateUtil.toNiceUTC(file.commit.gitAuthor.date);
			line += '  |  ' + file.commit.gitAuthor.name;
			if (file.commit.hubAuthor) {
				line += '  @  ' + file.commit.hubAuthor.login;
			}
			output.line(line);

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

	//dry helpers: reuse / bundle init and arg parsing for selector based commands

	var defaultJobOptions = ['config'];

	function jobOptions(merge:string[] = []):string[] {
		return defaultJobOptions.concat(merge);
	}

	//bundle some data
	class Job {
		api:tsd.API;
		context:tsd.Context;
		selector:Selector;
	}

	//very basic (async) init stuff
	function init(ctx:xm.ExposeContext):Q.Promise<void> {
		return loadPleonasm();
	}

	//get a API with a Context and parse basic arguments
	function getAPIJob(ctx:xm.ExposeContext):Q.Promise<Job> {
		var d:Q.Deferred<Job> = Q.defer();

		// callback for easy error reporting
		init(ctx).then(() => {
			//verify valid path
			if (ctx.hasArg('config')) {
				return FS.isFile(ctx.getArg('config')).then((isFile:boolean) => {
					if (!isFile) {
						throw new Error('specified --config is not a file: ' + ctx.getArg('config'));
					}
					return null;
				});
			}
			return null;
		}).then(() => {
			var job = new Job();
			job.context = getContext(ctx);
			job.api = new tsd.API(job.context);

			//TODO parse more standard options from args

			var required:boolean = ctx.hasArg('config');

			return job.api.readConfig(!required).then(() => {
				d.resolve(job);
			});
		}).fail(d.reject);

		return d.promise;
	}

	function getSelectorJob(ctx:xm.ExposeContext):Q.Promise<Job> {
		// callback for easy error reporting
		return getAPIJob(ctx).then((job:Job) => {
			if (ctx.numArgs !== 1) {
				throw new Error('pass one selector pattern');
			}

			//TODO support multiple selectors
			job.selector = new Selector(ctx.getArgAt(0));
			job.selector.blobSha = ctx.getArg('blob');
			job.selector.commitSha = ctx.getArg('commit');

			job.selector.timeout = ctx.getArg('timeout');
			job.selector.limitApi = ctx.getArg('limit');
			job.selector.minMatches = ctx.getArg('min');
			job.selector.maxMatches = ctx.getArg('max');

			job.selector.saveToConfig = ctx.getArg('save');
			job.selector.overwriteFiles = ctx.getArg('overwrite');
			job.selector.resolveDependencies = ctx.getArg('resolve');

			return job;
		});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function getExpose():xm.Expose {
		//xm.PackageJSON.getLocal().getNameVersion()
		var expose = new xm.Expose('', output);

		expose.before = (cmd:xm.ExposeCommand, ctx:xm.ExposeContext) => {
			return printPreviewNotice();
		};

		expose.defineGroup((group:xm.ExposeGroup) => {
			group.name = 'command';
			group.label = 'Main commands';
			group.options = ['config', 'commit', 'cacheDir', 'min', 'max', 'limit'];
			group.sorter = (one:xm.ExposeCommand, two:xm.ExposeCommand):number => {
				var sort:number;
				//TODO sane-ify sorting groups
				sort = xm.exposeSortHasElem(one.groups, two.groups, 'primary');
				if (sort !== 0) {
					return sort;
				}
				sort = xm.exposeSortHasElem(one.groups, two.groups, 'local');
				if (sort !== 0) {
					return sort;
				}
				sort = xm.exposeSortHasElem(one.groups, two.groups, 'info');
				if (sort !== 0) {
					return sort;
				}
				return xm.exposeSortIndex(one, two);
			};
		});

		expose.defineGroup((group:xm.ExposeGroup) => {
			group.name = 'help';
			group.label = 'Help commands';
		});

		// ---------

		//predefine
		//TODO fold options delcaration into a callback (same pattern as the commands)
		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'version';
			opt.short = 'V';
			opt.description = 'Display version information';
			opt.type = 'flag';
			opt.command = 'version';
			opt.global = true;
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'verbose';
			opt.description = 'Verbose output';
			opt.type = 'flag';
			opt.default = false;
			opt.global = true;
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'color';
			opt.description = 'Specify CLI color mode';
			opt.type = 'string';
			opt.placeholder = 'name';
			opt.global = true;
			opt.enum = styleMap.keys();
			opt.apply = (value, argv) => {
				useColor(value, argv);
			};
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'dev';
			opt.description = 'Development mode';
			opt.type = 'flag';
			opt.global = true;
		});

		// ---------

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'config';
			opt.description = 'Path to config file';
			opt.type = 'string';
			opt.placeholder = 'path';
			opt.global = false;
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'cacheDir';
			opt.description = 'Path to cache directory';
			opt.type = 'string';
			opt.placeholder = 'path';
			opt.global = false;
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'save';
			opt.short = 's';
			opt.description = 'Save to config file';
			opt.type = 'flag';
			opt.default = false;
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'overwrite';
			opt.short = 'o';
			opt.description = 'Overwrite existing definitions';
			opt.type = 'flag';
			opt.default = false;
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'limit';
			opt.short = 'l';
			opt.description = 'Sanity limit for expensive API calls, 0 = unlimited';
			opt.type = 'int';
			opt.default = 3;
			opt.placeholder = 'num';
			opt.note = ['not implemented'];
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'max';
			opt.description = 'Enforce a maximum amount of results, 0 = unlimited';
			opt.type = 'int';
			opt.default = 0;
			opt.placeholder = 'num';
			opt.note = ['not implemented'];
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'min';
			opt.description = 'Enforce a minimum amount of results';
			opt.type = 'int';
			opt.default = 0;
			opt.placeholder = 'num';
			opt.note = ['not implemented'];
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'timeout';
			opt.description = 'Set operation timeout in milliseconds, 0 = unlimited';
			opt.type = 'int';
			opt.default = 0;
			opt.global = true;
			opt.placeholder = 'ms';
			opt.note = ['not implemented'];
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'blob';
			opt.short = 'b';
			opt.description = 'Blob hash';
			opt.type = 'string';
			opt.placeholder = 'sha1';
			opt.global = false;
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'commit';
			opt.short = 'c';
			opt.description = 'Commit hash';
			opt.type = 'string';
			opt.placeholder = 'sha1';
			opt.global = false;
			opt.note = ['partially implemented'];
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			//TODO rename deps flag to solve? refer?
			opt.name = 'resolve';
			opt.short = 'r';
			opt.description = 'Include reference dependencies';
			opt.type = 'flag';
			opt.global = false;
			opt.default = false;
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'version';
			cmd.label = 'Display version';
			cmd.groups = ['help'];
			cmd.execute = ((ctx:xm.ExposeContext) => {
				output.line(xm.PackageJSON.getLocal().version);
				return null;
			});
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'settings';
			cmd.label = 'Display config settings';
			cmd.options = ['config', 'cacheDir'];
			cmd.groups = ['support'];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getAPIJob(ctx).then((job:Job) => {
					job.api.context.logInfo(true);
					return null;
				});
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'search';
			cmd.label = 'Search definitions';
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'query'];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getSelectorJob(ctx).then((job:Job) => {
					return job.api.search(job.selector).then((result:APIResult) => {
						reportSucces(null);

						//TODO report on overwrite
						result.selection.forEach((file:tsd.DefVersion) => {
							//printFile(file, true);
							printFile(file);
							output.line();
							//printFileInfo(file, true);
							//printFileCommit(file);
						});
					});
				}, reportError);
			};
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'install';
			cmd.label = 'Install definitions';
			cmd.options = ['overwrite', 'save', 'resolve'];
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'write'];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getSelectorJob(ctx).then((job:Job) => {
					return job.api.install(job.selector).then((result:APIResult) => {
						reportSucces(null);

						//TODO report on written/skipped

						result.written.keys().sort().forEach((path:string) => {
							var file:tsd.DefVersion = result.written.get(path);
							output.line(file.toString());
							//output.line('    ' + path);
							//output.line();
						});
					});
				}, reportError);
			};
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'info';
			cmd.label = 'Display definition info';
			cmd.variadic = ['selector'];
			cmd.options = ['resolve'];
			cmd.groups = ['command', 'primary', 'query'];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getSelectorJob(ctx).then((job:Job) => {
					return job.api.info(job.selector).then((result:APIResult) => {
						reportSucces(null);

						result.selection.sort(tsd.DefUtil.fileCompare).forEach((file:tsd.DefVersion) => {
							printFileHead(file);
							printFileInfo(file);
							printFileCommit(file);
							printDependencies(file);
						});
					});
				}, reportError, reportProgress);
			};
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'history';
			cmd.label = 'Display definition history';
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'query'];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getSelectorJob(ctx).then((job:Job) => {
					return job.api.history(job.selector).then((result:APIResult) => {
						reportSucces(null);

						result.definitions.sort(tsd.DefUtil.defCompare).forEach((def:tsd.Def) => {
							printDefHead(def);
							printSubHead('head:');
							printFileCommit(def.head);
							printSubHead('history:');

							def.history.slice(0).forEach((file:tsd.DefVersion) => {
								printFileInfo(file, true);
								printFileCommit(file);
							});
						});
					});
				}, reportError, reportProgress);
			};
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'reinstall';
			cmd.label = 'Re-install definitions from config';
			cmd.options = ['overwrite'];
			cmd.groups = ['command', 'local', 'write'];
			cmd.execute = (ctx:xm.ExposeContext) => {
				return getAPIJob(ctx).then((job:Job) => {
					return job.api.reinstall(ctx.getArg('option')).then((result:APIResult) => {
						reportSucces(null);
						//TODO report on written/skipped

						output.line();

						result.written.keys().sort().forEach((path:string) => {
							var file:tsd.DefVersion = result.written.get(path);
							output.line(file.toString());
							//output.line('    ' + path);
							output.line();
						});
					});
				}, reportError, reportProgress);
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
