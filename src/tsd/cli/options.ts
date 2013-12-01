///<reference path="../_ref.ts" />
///<reference path="../../xm/expose/Expose.ts" />
///<reference path="const.ts" />
///<reference path="../CLI.ts" />

module tsd {

	export module cli {

		export function addCommon(expose:xm.Expose):void {

			expose.defineCommand((cmd:xm.ExposeCommand) => {
				cmd.name = 'help';
				cmd.label = 'display usage help';
				cmd.groups = ['help'];
				cmd.execute = (ctx:xm.ExposeContext) => {
					ctx.expose.reporter.printCommands(ctx.getOpt(Opt.detail));
					return null;
				};
			});

			expose.defineCommand((cmd:xm.ExposeCommand) => {
				cmd.name = 'version';
				cmd.label = 'display version';
				cmd.groups = [Group.help];
				cmd.execute = ((ctx:xm.ExposeContext) => {
					return ctx.out.line(xm.PackageJSON.getLocal().version);
				});
			});

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
				opt.description = 'display progress notifications';
				opt.type = 'flag';
				opt.global = true;
				opt.note = ['experimental'];
				opt.apply = (value, ctx:xm.ExposeContext) => {
					ctx.out.ln().indent().warning('--progress events are not 100% yet').ln();
				};
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
				opt.default = xm.ExposeLevel.med;
				opt.enum = ['low', 'mid', 'high'];
				opt.note = ['partially implemented'];
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.semver;
				opt.short = 'v';
				opt.description = 'filter on version postfix';
				opt.type = 'string';
				opt.placeholder = 'range';
				opt.default = 'latest';
				opt.note = ['semver-range | latest | all'];
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.date;
				opt.short = 'd';
				opt.description = 'filter on commit date';
				opt.type = 'string';
				opt.placeholder = 'range';
				opt.note = ['example: ">2012-12-31"'];
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.commit;
				opt.short = 'c';
				opt.description = 'filter on commit hash';
				opt.type = 'string';
				opt.placeholder = 'sha1';
				opt.note = ['status unknown'];
			});

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.info;
				opt.short = 'i';
				opt.description = 'display definition info';
				opt.type = 'flag';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.history;
				opt.short = 'h';
				opt.description = 'display definition commit history';
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
				opt.global = false;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.cacheDir;
				opt.description = 'path to cache directory';
				opt.type = 'string';
				opt.placeholder = 'path';
				opt.global = false;
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
				opt.description = 'sanity limit for expensive API calls, 0 = unlimited';
				opt.type = 'int';
				opt.default = 2;
				opt.placeholder = 'num';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.max;
				opt.description = 'enforce a maximum amount of results, 0 = unlimited';
				opt.type = 'int';
				opt.default = 0;
				opt.placeholder = 'num';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.min;
				opt.description = 'enforce a minimum amount of results';
				opt.type = 'int';
				opt.default = 0;
				opt.placeholder = 'num';
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.timeout;
				opt.description = 'set operation timeout in milliseconds, 0 = unlimited';
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
				opt.description = 'save to config file';
				opt.type = 'flag';
				opt.default = false;
			});

			expose.defineOption((opt:xm.ExposeOption) => {
				opt.name = Opt.action;
				opt.short = 'a';
				opt.description = 'run action on selection';
				opt.type = 'string';
				opt.placeholder = 'name';
				opt.enum = [Action.install, Action.compare, Action.update, Action.open];
				opt.note = ['partially implemented'];
			});
		}
	}
}
