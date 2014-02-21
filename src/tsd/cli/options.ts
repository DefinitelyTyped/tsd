/// <reference path="../_ref.ts" />
/// <reference path="../../xm/expose/Expose.ts" />
/// <reference path="../../xm/enum.ts" />
/// <reference path="const.ts" />
/// <reference path="../CLI.ts" />

module tsd {
	'use strict';

	export module cli {

		export function addCommon(expose:xm.Expose, print:tsd.cli.Printer, style:tsd.cli.StyleMap):void {

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = 'help';
				opt.short = 'h';
				opt.description = 'display usage help';
				opt.type = 'flag';
				opt.command = 'help';
				opt.global = true;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.version;
				opt.short = 'V';
				opt.description = 'display version information';
				opt.type = 'flag';
				opt.command = 'version';
				opt.global = true;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.dev;
				opt.description = 'development mode';
				opt.type = 'flag';
				opt.global = true;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.style;
				opt.description = 'specify CLI style';
				opt.type = 'string';
				opt.placeholder = 'name';
				opt.global = true;
				opt.enum = style.getKeys();
				opt.default = (process.stdout.isTTY ? 'ansi' : 'no');
				opt.apply = (value:any, ctx:xm.ExposeContext) => {
					style.useStyle(value, ctx);
				};
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.progress;
				opt.short = 'p';
				opt.description = 'display progress notifications';
				opt.type = 'flag';
				opt.global = true;
				opt.default = true;
				// opt.note = ['experimental'];
				/*opt.apply = (value:any, ctx:xm.ExposeContext) => {
					ctx.out.ln().indent().warning('--progress events are not 100%').ln();
				};*/
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.verbose;
				opt.description = 'verbose output';
				opt.type = 'flag';
				opt.global = true;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.detail;
				opt.description = 'modify reporting detail level';
				opt.type = 'string';
				opt.global = true;
				opt.placeholder = 'level';
				opt.default = xm.ExposeLevel.med;
				opt.enum = ['low', 'mid', 'high'];
				opt.note = ['partially implemented'];
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.services;
				opt.description = 'allow usage-tracker, TSD updates etc';
				opt.type = 'flag';
				opt.default = true;
				opt.global = true;
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.semver;
				opt.short = 'v';
				opt.description = 'filter on version postfix';
				opt.type = 'string';
				opt.placeholder = 'range';
				opt.default = 'latest';
				opt.note = [
					'semver-range | latest | all',
					'example: ">0.2.4"'
				];
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.date;
				opt.short = 'd';
				opt.description = 'filter on commit date';
				opt.type = 'string';
				opt.placeholder = 'range';
				opt.note = ['example: "<2012-12-31"'];
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.commit;
				opt.short = 'c';
				opt.description = 'filter on commit hash';
				opt.type = 'string';
				opt.placeholder = 'sha1';
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.info;
				opt.short = 'i';
				opt.description = 'display definition file info';
				opt.type = 'flag';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.history;
				opt.short = 'y';
				opt.description = 'display commit history';
				opt.type = 'flag';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.resolve;
				opt.short = 'r';
				opt.description = 'include reference dependencies';
				opt.type = 'flag';
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.config;
				opt.description = 'path to config file';
				opt.type = 'string';
				opt.placeholder = 'path';
				opt.global = true;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.cacheDir;
				opt.description = 'path to cache directory';
				opt.type = 'string';
				opt.placeholder = 'path';
				opt.global = true;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.cacheMode;
				opt.description = 'change cache behaviour';
				opt.type = 'string';
				opt.placeholder = 'mode';
				opt.default = xm.http.CacheMode[xm.http.CacheMode.allowUpdate];
				opt.enum = xm.enumNames(xm.http.CacheMode);
				opt.global = true;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.overwrite;
				opt.short = 'o';
				opt.description = 'overwrite existing files';
				opt.type = 'flag';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.limit;
				opt.short = 'l';
				opt.description = 'sanity limit for expensive API calls';
				opt.type = 'int';
				opt.default = 2;
				opt.placeholder = 'num';
				opt.note = ['0 = unlimited'];
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.max;
				opt.description = 'enforce a maximum amount of results';
				opt.type = 'int';
				opt.default = 0;
				opt.placeholder = 'num';
				opt.note = ['0 = unlimited'];
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.min;
				opt.description = 'enforce a minimum amount of results';
				opt.type = 'int';
				opt.default = 0;
				opt.placeholder = 'num';
			});

			/*expose.defineOption((opt:xm.ExposeOption) => {
			 opt.name = Opt.timeout;
			 opt.description = 'set operation timeout in milliseconds';
			 opt.type = 'int';
			 opt.default = 0;
			 opt.global = true;
			 opt.placeholder = 'ms';
			 opt.note = ['0 = unlimited', 'not implemented'];
			 });*/

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.save;
				opt.short = 's';
				opt.description = 'save changes to config file';
				opt.type = 'flag';
				opt.default = false;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.bundle;
				opt.short = 'b';
				opt.description = 'save to reference bundle';
				opt.type = 'string[]';
				opt.placeholder = 'name';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.action;
				opt.short = 'a';
				opt.description = 'run action on selection';
				opt.type = 'string';
				opt.placeholder = 'name';
				opt.enum = [Action.install, Action.browse, Action.visit]; // , Action.compare, Action.update, Action.open];
			});
		}
	}
}
