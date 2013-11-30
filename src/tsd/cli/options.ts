///<reference path="../_ref.ts" />
///<reference path="../../xm/io/Expose.ts" />
///<reference path="const.ts" />
///<reference path="../CLI.ts" />

module tsd {

	export module cli {

		export function addOptions(expose:xm.Expose):void {

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.version;
				opt.short = 'V';
				opt.description = 'Display version information';
				opt.type = 'flag';
				opt.command = 'version';
				opt.global = true;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.dev;
				opt.description = 'Development mode';
				opt.type = 'flag';
				opt.global = true;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.color;
				opt.description = 'Specify CLI color mode';
				opt.type = 'string';
				opt.placeholder = 'name';
				opt.global = true;
				opt.enum = tsd.styleMap.keys();
				opt.default = 'ansi';
				opt.apply = (value, ctx:xm.ExposeContext) => {
					tsd.useColor(value, ctx);
				};
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.progress;
				opt.short = 'p';
				opt.description = 'Display progress notifications';
				opt.type = 'flag';
				opt.global = true;
				opt.note = ['experimental'];
				opt.apply = (value, ctx:xm.ExposeContext) => {
					ctx.out.warning('--progress events are not 100% yet');
				};
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.verbose;
				opt.description = 'Verbose output';
				opt.type = 'flag';
				opt.global = true;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.detail;
				opt.description = 'Modify reporting detail level';
				opt.type = 'string';
				opt.global = true;
				opt.default = 'mid';
				opt.enum = ['low', 'mid', 'high'];
				opt.note = ['partially implemented'];
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.semver;
				opt.short = 'v';
				opt.description = 'Filter on version postfix';
				opt.type = 'string';
				opt.placeholder = 'range';
				opt.default = 'latest';
				opt.note = ['semver-range | latest | all'];
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.date;
				opt.short = 'd';
				opt.description = 'Filter on commit date';
				opt.type = 'string';
				opt.placeholder = 'range';
				opt.note = ['example: ">2012-12-31"'];
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.commit;
				opt.short = 'c';
				opt.description = 'Filter on commit hash';
				opt.type = 'string';
				opt.placeholder = 'sha1';
				opt.note = ['status unknown'];
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.info;
				opt.short = 'i';
				opt.description = 'Display definition info';
				opt.type = 'flag';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.history;
				opt.short = 'h';
				opt.description = 'Display definition commit history';
				opt.type = 'flag';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.resolve;
				opt.short = 'r';
				opt.description = 'Include reference dependencies';
				opt.type = 'flag';
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.config;
				opt.description = 'Path to config file';
				opt.type = 'string';
				opt.placeholder = 'path';
				opt.global = false;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.cacheDir;
				opt.description = 'Path to cache directory';
				opt.type = 'string';
				opt.placeholder = 'path';
				opt.global = false;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.overwrite;
				opt.short = 'o';
				opt.description = 'Overwrite existing files';
				opt.type = 'flag';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.limit;
				opt.short = 'l';
				opt.description = 'Sanity limit for expensive API calls, 0 = unlimited';
				opt.type = 'int';
				opt.default = 2;
				opt.placeholder = 'num';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.max;
				opt.description = 'Enforce a maximum amount of results, 0 = unlimited';
				opt.type = 'int';
				opt.default = 0;
				opt.placeholder = 'num';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.min;
				opt.description = 'Enforce a minimum amount of results';
				opt.type = 'int';
				opt.default = 0;
				opt.placeholder = 'num';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.timeout;
				opt.description = 'Set operation timeout in milliseconds, 0 = unlimited';
				opt.type = 'int';
				opt.default = 0;
				opt.global = true;
				opt.placeholder = 'ms';
				opt.note = ['not implemented'];
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.save;
				opt.short = 's';
				opt.description = 'Save to config file';
				opt.type = 'flag';
				opt.default = false;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.action;
				opt.short = 'a';
				opt.description = 'Run action on selection';
				opt.type = 'string';
				opt.placeholder = 'name';
				opt.enum = [Action.install, Action.compare, Action.update, Action.open];
				opt.note = ['partially implemented'];
			});
		}
	}
}
