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

	function useColor(color:string, argv) {
		switch (color) {
			case 'no':
			case 'off':
			case 'none':
				output.useStyler(new xm.styler.NoStyler());
				break;
			case 'ansi':
				output.useStyler(new xm.styler.ANSIStyler());
				break;
			case 'html':
				output.useStyler(new xm.styler.HTMLWrapStyler());
				break;
			case 'css':
				output.useStyler(new xm.styler.CSSStyler());
				break;
			case 'dev':
				output.useStyler(new xm.styler.DevStyler());
				break;
			default:
				output.useStyler(new xm.styler.NoStyler());
				break;
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

	function getContext(args?:any):tsd.Context {
		xm.assertVar(args, 'object', 'args');

		var context = new tsd.Context(args.config, args.verbose);

		if (args.dev) {
			context.paths.cacheDir = path.resolve(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
		}
		else {
			context.paths.cacheDir = Paths.getUserCacheDir();
		}
		return context;
	}

	//TODO further unify reporting format (consistent details and don't rely on toString()'s) (See TODO.md)

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//dry helpers: reuse / bundle init and arg parsing for selector based commands

	var defaultJobOptions = ['config'];

	function jobOptions(merge:string[] = []):string[] {
		return defaultJobOptions.concat(merge);
	}

	class Job {
		context:tsd.Context;
		api:tsd.API;
		selector:Selector;
		//TODO add options object?
	}

	function init(args:any):Q.Promise<void> {
		return loadPleonasm();
	}

	function getAPIJob(args:any):Q.Promise<Job> {
		var d:Q.Deferred<Job> = Q.defer();

		// callback for easy error reporting
		init(args).then(() => {
			//verify valid path
			if (args.config) {
				return FS.isFile(<string>args.config).then((isFile:boolean) => {
					if (!isFile) {
						throw new Error('specified config is not a file: ' + args.config);
					}
					return null;
				});
			}
			return null;
		}).then(() => {
			var job = new Job();
			job.context = getContext(args);
			job.api = new tsd.API(job.context);

			//TODO parse more standard options from args

			var required:boolean = (typeof args.config !== undefined ? true : false);

			return job.api.readConfig(required).then(() => {
				d.resolve(job);
			});
		}).fail(d.reject);

		return d.promise;
	}

	function getSelectorJob(args:any):Q.Promise<Job> {
		// callback for easy error reporting
		return getAPIJob(args).then((job:Job) => {
			if (args._.length !== 1) {
				throw new Error('pass one selector pattern');
			}

			//TODO parse selector options from args
			//TODO support multiple selectors

			job.selector = new Selector(args._[0]);
			return job;
		});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	/*
	 runARGV: run raw cli arguments, like process.argv
	 */
	export function runARGV(argvRaw:any) {
		//xm.PackageJSON.getLocal().getNameVersion()
		var expose = new xm.Expose('', output);

		expose.before = (cmd:xm.ExposeCommand, args:any) => {
			return printPreviewNotice();
		};

		expose.defineGroup((group:xm.ExposeGroup) => {
			group.name = 'command';
			group.label = 'Main commands';
			group.options = ['config'];
			group.sorter = (one:xm.ExposeCommand, two:xm.ExposeCommand):number => {
				var sort:number;
				sort = xm.exposeSortHasElem(one.groups, two.groups, 'primary');
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
			opt.name = 'config';
			opt.description = 'Path to config file';
			opt.short = 'c';
			opt.type = 'string';
			opt.placeholder = 'path';
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'verbose';
			opt.description = 'Verbose output';
			opt.type = 'flag';
			opt.default = false;
			opt.global = true;
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'dev';
			opt.description = 'Development mode';
			opt.type = 'flag';
			opt.global = true;
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'dummy';
			opt.description = 'Dummy mode';
			opt.type = 'flag';
			opt.global = false;
		});

		expose.defineOption((opt:xm.ExposeOption) => {
			opt.name = 'color';
			opt.description = 'Specify CLI color mode';
			opt.type = 'string';
			opt.global = true;
			opt.apply = (value, argv) => {
				useColor(value, argv);
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		function reportError(err:any) {
			output.error('-> ' + 'an error occured!').clear();

			if (err.stack) {
				output.block(err.stack);
			}
			else {
				output.line(err);
			}
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

		function printSubHead(text:string) {
			output.line(' ' + text);
			output.ruler2();
		}

		function printDefHead(def:tsd.Def) {
			output.line(def.toString() + ' ' + pleo(def.head.blob.shaShort));
			output.ruler2();
		}

		function printFileHead(file:tsd.DefVersion) {
			output.line(file.toString()) + ' ' + pleo(file.blob.shaShort);
			output.ruler2();
		}

		function printFileCommit(file:tsd.DefVersion, skipNull:boolean = false) {
			if (file.commit) {
				var line = '   ' + file.commit.commitShort;

				line += '  |  ' + xm.DateUtil.toNiceUTC(file.commit.gitAuthor.date);
				line += '  |  ' + file.commit.gitAuthor.name;
				if (file.commit.hubAuthor) {
					line += ' @' + file.commit.hubAuthor.login;
				}
				output.line(line);

				//TODO full indent message
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

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'version';
			cmd.label = 'Display version';
			cmd.groups = ['help'];
			cmd.execute = (args:any) => {
				output.line(xm.PackageJSON.getLocal().version);
				return null;
			};
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'settings';
			cmd.label = 'Display config settings';
			cmd.options = ['config'];
			cmd.groups = ['support'];
			cmd.execute = (args:any) => {
				return getAPIJob(args).then((job:Job) => {
					job.api.context.logInfo(true);
					return null;
				});
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'search';
			cmd.label = 'Search definitions';
			cmd.options = ['config'];
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'query'];
			cmd.execute = (args:any) => {
				return getSelectorJob(args).then((job:Job) => {
					return job.api.search(job.selector).then((result:APIResult) => {
						reportSucces(null);

						//TODO report on overwrite
						result.selection.forEach((file:tsd.DefVersion) => {
							printFileHead(file);
							printFileInfo(file);
							//printFileCommit(file);
						});
					});
				}, reportError);
			};
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'install';
			cmd.label = 'Install definitions';
			cmd.options = jobOptions(['save']);
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'write'];
			cmd.execute = (args:any) => {
				return getSelectorJob(args).then((job:Job) => {
					return job.api.install(job.selector).then((result:APIResult) => {
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
				}, reportError);
			};
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'reinstall';
			cmd.label = 'Re-install definitions from config';
			cmd.options = jobOptions();
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'write'];
			cmd.execute = (args:any) => {
				return getAPIJob(args).then((job:Job) => {
					return job.api.reinstall().then((result:APIResult) => {
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
				}, reportError);
			};
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'info';
			cmd.label = 'Display definition info';
			cmd.options = jobOptions();
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'query'];
			cmd.execute = (args:any) => {
				return getSelectorJob(args).then((job:Job) => {
					return job.api.info(job.selector).then((result:APIResult) => {
						reportSucces(null);

						result.selection.sort(tsd.DefUtil.fileCompare).forEach((file:tsd.DefVersion) => {
							printFileHead(file);
							printFileInfo(file);
							printFileCommit(file);
						});
					});
				}, reportError);
			};
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'history';
			cmd.label = 'Display definition history';
			cmd.options = jobOptions();
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'query'];
			cmd.execute = (args:any) => {
				return getSelectorJob(args).then((job:Job) => {
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
				}, reportError);
			};
		});

		expose.createCommand((cmd:xm.ExposeCommand) => {
			cmd.name = 'deps';
			cmd.label = 'List dependencies';
			cmd.options = jobOptions();
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'info', 'query'];
			cmd.execute = (args:any) => {
				return getSelectorJob(args).then((job:Job) => {
					return job.api.deps(job.selector).then((result:APIResult) => {
						reportSucces(null);

						result.selection.sort(tsd.DefUtil.fileCompare).forEach((def:tsd.DefVersion) => {
							printFileHead(def);
							printFileInfo(def);

							//move to method
							if (def.dependencies.length > 0) {
								def.dependencies.sort(tsd.DefUtil.defCompare).forEach((def:tsd.Def) => {
									output.line(' - ' + def.toString());
									if (def.head.dependencies.length > 0) {
										def.head.dependencies.sort(tsd.DefUtil.defCompare).forEach((def:tsd.Def) => {
											output.line('    - ' + def.toString());
										});
									}
								});
								output.ruler2();
							}
						});
					});
				}, reportError);
			};
		});

		/*expose.command('purge', (args:any) => {
		 var api = new API(getContext(args));

		 api.purge().then(() => {

		 }, (err) => {
		 output.line('an error occured');
		 output.line(err);
		 });
		 }, 'purge caches');*/

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.executeArgv(argvRaw, 'help');
	}
}
