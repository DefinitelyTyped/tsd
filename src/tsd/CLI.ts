///<reference path="_ref.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/Expose.ts" />
///<reference path="../xm/io/FileUtil.ts" />
///<reference path="../xm/DateUtil.ts" />
///<reference path="context/Context.ts" />

module tsd {

	var path = require('path');
	var Q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');

	function getContext(args?:any):tsd.Context {
		xm.assertVar('args', args, 'object');

		var context = new tsd.Context(args.config, args.verbose);

		if (args.dev) {
			context.paths.cacheDir = path.join(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
		}
		return context;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//DRY helpers: reuse / bundle init and arg parsing for selector based commands

	var defaultJobOptions = ['config', 'verbose'];

	function jobOptions(merge?:string[] = []):string[] {
		return defaultJobOptions.concat(merge);
	}

	class Job {
		context:tsd.Context;
		api:tsd.API;
		selector:Selector;
		//TODO add options object?
	}

	function getAPIJob(args:any):Qpromise {
		// callback for easy error reporting
		return Q.fcall(() => {
			//verify valid path
			if (args.config) {
				return FS.isFile(<string>args.config).then((isFile:bool) => {
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

			// TODO parse more options

			var required:bool = (!!args.config);
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

			// TODO multiple selectors

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

		var directNode = (argvRaw && argvRaw.length > 0 && argvRaw[0] === 'node');

		xm.log.debug('called directly as node param: ' + 'forcing dev mode (for now)'.cyan);

		//predefine
		expose.defineOption({
			name: 'version',
			short: 'V',
			description: 'display version information',
			type: 'flag',
			default: null,
			placeholder: null,
			command: 'version'
		});

		expose.defineOption({
			name: 'config',
			description: 'path to config file',
			short: 'c',
			type: 'string',
			default: null,
			placeholder: 'path',
			command: null
		});

		expose.defineOption({
			name: 'verbose',
			short: null,
			description: 'verbose output',
			type: 'flag',
			default: (directNode ? true : null),
			placeholder: null,
			command: null
		});

		expose.defineOption({
			name: 'dev',
			short: null,
			description: 'development mode',
			type: 'flag',
			default: null,
			placeholder: null,
			command: null
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

		function prinDefHead(def:tsd.Def) {
			xm.log('');
			xm.log(def.toString());
			xm.log('----');
		}

		function prinFileHead(file:tsd.DefVersion) {
			xm.log('');
			xm.log(file.toString());
			xm.log('----');
		}

		function printFileCommit(file:tsd.DefVersion) {
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
			else {
				xm.log('   ' + '<no commmit>');
				xm.log('----');
			}
		}

		function printFileInfo(file:tsd.DefVersion) {
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
			else {
				xm.log('   ' + '<no info>');
				xm.log('----');
			}
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.command('version', (args:any) => {
			xm.log(xm.PackageJSON.getLocal().version);
		}, 'Display version');

		expose.command('settings', (args:any) => {
			getContext(args).logInfo(true);
		}, 'Display config settings');

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.command('search', (args:any) => {
			getSelectorJob(args).then((job:Job) => {
				return job.api.search(job.selector);

			}).done((result:APIResult) => {
				reportSucces(null);

				//TODO report on overwrite
				result.selection.forEach((file:tsd.DefVersion) => {
					prinFileHead(file);
					printFileInfo(file);
					printFileCommit(file);
				});
			}, reportError);
		}, 'Search definitions', jobOptions(), ['selector']);

		expose.command('install', (args:any) => {
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
		}, 'Install definitions', jobOptions(), ['selector']);
		;

		expose.command('reinstall', (args:any) => {
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
		}, 'Re-install definitions from config', jobOptions(), ['selector']);


		expose.command('info', (args:any) => {
			getSelectorJob(args).then((job:Job) => {
				return job.api.info(job.selector);

			}).done((result:APIResult) => {
				reportSucces(null);

				result.selection.sort(tsd.DefUtil.fileCompare).forEach((file:tsd.DefVersion) => {
					prinFileHead(file);
					printFileInfo(file);
					printFileCommit(file);
				});
			}, reportError);

		}, 'Show definition details', jobOptions(), ['selector']);

		expose.command('history', (args:any) => {
			getSelectorJob(args).then((job:Job) => {
				return job.api.history(job.selector);

			}).done((result:APIResult) => {
				reportSucces(null);

				result.definitions.sort(tsd.DefUtil.defCompare).forEach((def:tsd.Def) => {
					prinDefHead(def);
					printFileInfo(def.head);

					def.history.slice(0).reverse().forEach((file:tsd.DefVersion) => {
						printFileInfo(file);
						printFileCommit(file);
					});
				});
			}, reportError);

		}, 'Show definition history', jobOptions(), ['selector']);

		expose.command('deps', (args:any) => {
			getSelectorJob(args).then((job:Job) => {

				return job.api.deps(job.selector);

			}).done((result:APIResult) => {
				reportSucces(null);

				result.selection.sort(tsd.DefUtil.fileCompare).forEach((def:tsd.DefVersion) => {
					prinFileHead(def);
					printFileInfo(def);

					//move ot method
					if (def.dependencies.length > 0) {
						def.dependencies.sort(tsd.DefUtil.fileCompare).forEach((def:tsd.DefVersion) => {
							xm.log(' - ' + def.toString());
							if (def.dependencies.length > 0) {
								def.dependencies.sort(tsd.DefUtil.fileCompare).forEach((def:tsd.DefVersion) => {
									xm.log('    - ' + def.toString());
								});
							}
						});
						xm.log('----');
					}
				});
			}, reportError);

		}, 'List dependencies', jobOptions(), ['selector']);

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
