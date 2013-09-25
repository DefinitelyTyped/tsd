///<reference path="_ref.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/Expose.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/DateUtil.ts" />
///<reference path="context/Context.ts" />

module tsd {
	'use strict';

	var path = require('path');
	var Q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');

	var pleonasm;

	function pleo(input) {
		input = input.substring(0, 6);
		return '\'' + pleonasm.encode(input, '_', '_').code + '\'';
	}

	function getContext(args?:any):tsd.Context {
		xm.assertVar('args', args, 'object');

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

	//DRY helpers: reuse / bundle init and arg parsing for selector based commands

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

	function loadData(args:any):Qpromise {
		return Q.nfcall((callback) => {
			if (!pleonasm) {
				pleonasm = require('pleonasm');
				pleonasm.onload = () => {
					xm.callAsync(callback);
				};
			}
			xm.callAsync(callback);
		});
		/*.then(() => {
		 var encoded = pleonasm.encode('aabbaa').code;
		 xm.log(encoded);
		 });*/
	}

	function getAPIJob(args:any):Qpromise {
		// callback for easy error reporting
		return loadData(args).then(() => {
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

			// TODO parse more options from args

			var required:boolean = (typeof args.config !== undefined ? true : false);
			return job.api.readConfig(required).then(() => {
				return job;
			});
		});
	}

	function getSelectorJob(args:any):Qpromise {
		// callback for easy error reporting
		return getAPIJob(args).then((job:Job) => {
			if (args._.length !== 1) {
				throw new Error('pass one selector pattern');
			}

			// TODO parse selector options from args
			// TODO support multiple selectors

			job.selector = new Selector(args._[0]);
			return job;
		});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	/*
	 runARGV: run raw cli arguments, like process.argv
	 */
	export function runARGV(argvRaw:any) {

		var expose = new xm.Expose(xm.PackageJSON.getLocal().getNameVersion());

		expose.createGroup('command', (group:xm.ExposeGroup) => {
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

		expose.createGroup('help', (group:xm.ExposeGroup) => {
			group.label = 'Help commands';
		});

		//predefine
		expose.defineOption({
			name: 'version',
			short: 'V',
			description: 'Display version information',
			type: 'flag',
			default: null,
			placeholder: null,
			command: 'version',
			global: true
		});

		expose.defineOption({
			name: 'config',
			description: 'Path to config file',
			short: 'c',
			type: 'string',
			default: null,
			placeholder: 'path',
			command: null,
			global: false
		});

		expose.defineOption({
			name: 'verbose',
			short: null,
			description: 'Verbose output',
			type: 'flag',
			default: false,
			placeholder: null,
			command: null,
			global: true
		});

		expose.defineOption({
			name: 'dev',
			short: null,
			description: 'Development mode',
			type: 'flag',
			default: null,
			placeholder: null,
			command: null,
			global: true
		});

		expose.defineOption({
			name: 'dummy',
			short: null,
			description: 'Dummy mode',
			type: 'flag',
			default: null,
			placeholder: null,
			command: null,
			global: false
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		function reportError(err:any) {
			xm.log('-> ' + 'an error occured!'.red);
			xm.log('');
			if (err.stack) {
				xm.log(err.stack);
			}
			else {
				xm.log(String(err));
			}
		}

		function reportSucces(result:tsd.APIResult) {
			xm.log('');
			xm.log('-> ' + 'success!'.green);
			if (result) {
				xm.assertVar('result', result, tsd.APIResult);
				xm.log('');
				result.selection.forEach((def:tsd.DefVersion) => {
					xm.log(def.toString());
					if (def.info) {
						xm.log(def.info.toString());
						xm.log(def.info);
					}
				});
			}
		}

		function printSubHead(text:string) {
			xm.log(' ' + text);
			xm.log('----');
		}

		function printDefHead(def:tsd.Def) {
			xm.log('');
			xm.log(def.toString() + ' ' + pleo(def.head.blob.shaShort));
			xm.log('----');
		}

		function printFileHead(file:tsd.DefVersion) {
			xm.log('');
			xm.log(file.toString()) + ' ' + pleo(file.blob.shaShort);
			xm.log('----');
		}

		function printFileCommit(file:tsd.DefVersion, skipNull:boolean = false) {
			if (file.commit) {
				var line = '   ' + file.commit.commitShort;

				line += ' | ' + xm.DateUtil.toNiceUTC(file.commit.gitAuthor.date);
				line += ' | ' + file.commit.gitAuthor.name;
				if (file.commit.hubAuthor) {
					line += ' @' + file.commit.hubAuthor.login;
				}
				xm.log(line);

				//TODO full indent message
				xm.log('   ' + file.commit.message.subject);
				xm.log('----');
			}
			else if (!skipNull) {
				xm.log('   ' + '<no commmit>');
				xm.log('----');
			}
		}

		function printFileInfo(file:tsd.DefVersion, skipNull:boolean = false) {
			if (file.info) {
				if (file.info.isValid()) {
					xm.log('   ' + file.info.toString());
					xm.log('      ' + file.info.projectUrl);
					file.info.authors.forEach((author:xm.AuthorInfo) => {
						xm.log('      ' + author.toString());
					});
					xm.log('----');
				}
				else {
					xm.log('   ' + '<invalid info>');
					xm.log('----');
				}
			}
			else if (!skipNull) {
				xm.log('   ' + '<no info>');
				xm.log('----');
			}
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.createCommand('version', (cmd:xm.ExposeCommand) => {
			cmd.label = 'Display version';
			cmd.groups = ['help'];
			cmd.execute = (args:any) =>  {
				xm.log(xm.PackageJSON.getLocal().version);
			};
		});

		expose.createCommand('settings', (cmd:xm.ExposeCommand) => {
			cmd.label = 'Display config settings';
			cmd.options = ['config'];
			cmd.groups = ['support'];
			cmd.execute = (args:any) =>  {
				getContext(args).logInfo(true);
			};
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.createCommand('search', (cmd:xm.ExposeCommand) => {
			cmd.label = 'Search definitions';
			cmd.options = ['config'];
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'query'];
			cmd.execute = (args:any) =>  {
				getSelectorJob(args).then((job:Job) => {
					return job.api.search(job.selector);

				}).done((result:APIResult) => {
					reportSucces(null);

					//TODO report on overwrite
					result.selection.forEach((file:tsd.DefVersion) => {
						printFileHead(file);
						printFileInfo(file);
						printFileCommit(file);
					});
				}, reportError);
			};
		});

		expose.createCommand('install', (cmd:xm.ExposeCommand) => {
			cmd.label = 'Install definitions';
			cmd.options = jobOptions(['save']);
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'write'];
			cmd.execute = (args:any) =>  {
				getSelectorJob(args).then((job:Job) => {
					return job.api.install(job.selector);

				}).done((result:APIResult) => {
					reportSucces(null);
					//TODO report on written/skipped

					xm.log('');
					result.written.keys().sort().forEach((path:string) => {
						var file:tsd.DefVersion = result.written.get(path);
						xm.log(file.toString());
						//xm.log('    ' + path);
						xm.log('');
					});
				}, reportError);
			};
		});

		expose.createCommand('reinstall', (cmd:xm.ExposeCommand) => {
			cmd.label = 'Re-install definitions from config';
			cmd.options = jobOptions();
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'write'];
			cmd.execute = (args:any) =>  {
				getAPIJob(args).then((job:Job) => {
					return job.api.reinstall();

				}).done((result:APIResult) => {
					reportSucces(null);
					//TODO report on written/skipped

					xm.log('');
					result.written.keys().sort().forEach((path:string) => {
						var file:tsd.DefVersion = result.written.get(path);
						xm.log(file.toString());
						//xm.log('    ' + path);
						xm.log('');
					});
				}, reportError);
			};
		});

		expose.createCommand('info', (cmd:xm.ExposeCommand) => {
			cmd.label = 'Display definition info';
			cmd.options = jobOptions();
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'query'];
			cmd.execute = (args:any) =>  {
				getSelectorJob(args).then((job:Job) => {
					return job.api.info(job.selector);

				}).done((result:APIResult) => {
					reportSucces(null);

					result.selection.sort(tsd.DefUtil.fileCompare).forEach((file:tsd.DefVersion) => {
						printFileHead(file);
						printFileInfo(file);
						printFileCommit(file);
					});
				}, reportError);
			};
		});

		expose.createCommand('history', (cmd:xm.ExposeCommand) => {
			cmd.label = 'Display definition history';
			cmd.options = jobOptions();
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'primary', 'query'];
			cmd.execute = (args:any) =>  {
				getSelectorJob(args).then((job:Job) => {
					return job.api.history(job.selector);

				}).done((result:APIResult) => {
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
				}, reportError);

			};
		});

		expose.createCommand('deps', (cmd:xm.ExposeCommand) => {
			cmd.label = 'List dependencies';
			cmd.options = jobOptions();
			cmd.variadic = ['selector'];
			cmd.groups = ['command', 'info', 'query'];
			cmd.execute = (args:any) =>  {
				getSelectorJob(args).then((job:Job) => {
					return job.api.deps(job.selector);

				}).done((result:APIResult) => {
					reportSucces(null);

					result.selection.sort(tsd.DefUtil.fileCompare).forEach((def:tsd.DefVersion) => {
						printFileHead(def);
						printFileInfo(def);

						//move ot method
						if (def.dependencies.length > 0) {
							def.dependencies.sort(tsd.DefUtil.defCompare).forEach((def:tsd.Def) => {
								xm.log(' - ' + def.toString());
								if (def.head.dependencies.length > 0) {
									def.head.dependencies.sort(tsd.DefUtil.defCompare).forEach((def:tsd.Def) => {
										xm.log('    - ' + def.toString());
									});
								}
							});
							xm.log('----');
						}
					});
				}, reportError);
			};
		});

		/*expose.command('purge', (args:any) => {
		 var api = new API(getContext(args));

		 api.purge().done(() => {

		 }, (err) => {
		 xm.log('an error occured');
		 xm.log(err);
		 });
		 }, 'purge caches');*/

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.executeArgv(argvRaw, 'help');
	}
}
