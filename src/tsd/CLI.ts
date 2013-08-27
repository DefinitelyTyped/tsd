///<reference path="_ref.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/Expose.ts" />

module tsd {

	var path = require('path');
	var Q:QStatic = require('q');

	function getContext(args?:any):tsd.Context {
		xm.assertVar('args', args, 'object');
		return new tsd.Context(args.config, args.verbose);
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
		selector:tsd.Selector;
		options:tsd.APIOptions;
	}

	function getSelectorJob(args:any):Qpromise {
		// callback for easy error reporting
		return Q.fcall(() => {
			var job = new Job();
			if (args._.length === 0) {
				throw new Error('pass a name selector pattern');
			}
			job.context = getContext(args);
			job.api = new tsd.API(job.context);

			job.selector = new Selector(args._[0]);
			job.options = new APIOptions();
			// TODO parse options
			return job;
		});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function runARGV(argvRaw:any, configPath?:string) {

		var expose = new xm.Expose(xm.PackageJSON.getLocal().getNameVersion());

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
			default: null,
			placeholder: null,
			command: null
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		function reportError(err) {
			xm.log('->' + 'an error occured!'.red);
			xm.log(err);
		}

		function reportSucces(result) {
			xm.log('->' + 'success!'.green);
			if (result) {
				xm.log.inspect(result, null, 2);
			}
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.command('version', (args:any) => {
			xm.log(xm.PackageJSON.getLocal().version);
		}, 'display version');

		expose.command('info', (args:any) => {
			getContext(args).logInfo(true);
		}, 'display config settings');

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expose.command('search', (args:any) => {
			getSelectorJob(args).then((job:Job) => {
				return job.api.search(job.selector, job.options);

			}).done(reportSucces, reportError);
		}, 'search definitions', jobOptions(), ['selector']);

		expose.command('install', (args:any) => {
			getSelectorJob(args).then((job:Job) => {
				return job.api.install(job.selector, job.options);

			}).done(reportSucces, reportError);
		}, 'install definitions', jobOptions(), ['selector']);

		expose.command('details', (args:any) => {
			getSelectorJob(args).then((job:Job) => {
				return job.api.details(job.selector, job.options);

			}).done((result:APIResult) => {
				//hackable
				reportSucces(result);
			}, reportError);

		}, 'show definition details', jobOptions(), ['selector']);


		expose.command('deps', (args:any) => {
			getSelectorJob(args).then((job:Job) => {
				return job.api.deps(job.selector, job.options);

			}).done((result:APIResult) => {
				//hackable
				reportSucces(result);
			}, reportError);

		}, 'list dependencies', jobOptions(), ['selector']);
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
