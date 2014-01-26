/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="../_ref.d.ts" />
/// <reference path="../iterate.ts" />
/// <reference path="../assertVar.ts" />
/// <reference path="../typeOf.ts" />
/// <reference path="../object.ts" />
/// <reference path="../Logger.ts" />
/// <reference path="../parseString.ts" />
/// <reference path="../StyledOut.ts" />
/// <reference path="ExposeReporter.ts" />
/// <reference path="ExposeContext.ts" />

/*
 Expose: cli command manager and help generator
 */
module xm {
	'use strict';

	var optimist = require('optimist');
	var jsesc = require('jsesc');
	var Q:typeof Q = require('q');
	// TODO ditch node-exit if node ever get fixed..
	var exitProcess:(code:number) => void = require('exit');

	export interface ExposeHook {
		(ctx:ExposeContext):any;
	}

	export interface ExposeHandle {
		(res:ExposeResult):any;
	}

	export interface ExposeOptionApply {
		(value:any, ctx:ExposeContext):void;
	}

	export interface ExposeResult {
		code:number;
		ctx:ExposeContext;
		error:ExposeError;
	}

	// TODO add some extra properties?
	export interface ExposeError extends Error {
	}

	export interface ExposeSorter {
		(one:ExposeCommand, two:ExposeCommand):number;
	}

	export class ExposeCommand {
		name:string;
		execute:ExposeHook;
		index:number;

		label:string;
		hidden:boolean;
		options:string[] = [];
		variadic:string[] = [];
		groups:string[] = [];
		note:string[] = [];
		internal:boolean;

		constructor() {
		}
	}

	export class ExposeGroup {
		name:string;
		label:string;
		index:number;
		sorter:ExposeSorter = xm.exposeSortIndex;
		options:string[] = [];

		constructor() {
		}
	}

	export class ExposeOption {
		name:string;
		description:string;
		short:string;
		type:string;
		placeholder:string;
		default:any;
		command:string;
		global:boolean = false;
		// TODO implement optional
		optional:boolean = true;
		enum:any[] = [];
		note:string[] = [];
		// TODO implement example
		example:string[] = [];
		apply:ExposeOptionApply;
	}

	/*
	 Expose: cli command manager, wraps optimist with better usage generator and other utils
	 */
	// TODO add detail level switch / more/less flag
	// TODO add per-command sub-help like npm
	// TODO add feature for printable placeholder sub-info (format etc)
	// TODO unify Actions and Commands (same thing really)
	// TODO implement Actions/Commands queue
	// TODO drop optimist for something simpler (minimist)
	export class Expose {

		commands = new Map<string, ExposeCommand>();
		options = new Map<string, ExposeOption>();
		groups = new Map<string, ExposeGroup>();
		mainGroup = new ExposeGroup();

		private _isInit = false;
		private _index = 0;

		reporter:xm.ExposeReporter;

		before:ExposeHook;
		after:ExposeHook;
		end:ExposeHandle;

		constructor(output:xm.StyledOut = null) {
			this.reporter = new xm.ExposeReporter(this, output);

			xm.object.defineProps(this, ['commands', 'options', 'groups', 'mainGroup'], {
				writable: false,
				enumerable: false
			});
		}

		defineOption(build:(opt:ExposeOption) => void) {
			var opt = new ExposeOption();
			build(opt);

			if (opt.type === 'flag' && xm.isUndefined(opt.default)) {
				opt.default = false;
			}

			xm.assertVar(opt.name, 'string', 'opt.name');

			if (this.options.has(opt.name)) {
				throw new Error('opt.name collision on ' + opt.name);
			}
			this.options.set(opt.name, opt);
		}

		defineCommand(build:(cmd:ExposeCommand) => void):void {
			var cmd = new ExposeCommand();
			build(cmd);
			cmd.index = (++this._index);

			xm.assertVar(cmd.name, 'string', 'build.name');

			if (this.commands.has(cmd.name)) {
				throw new Error('cmd.name collision on ' + cmd.name);
			}
			this.commands.set(cmd.name, cmd);
		}

		defineGroup(build:(group:ExposeGroup) => void):void {
			var group = new ExposeGroup();
			build(group);
			group.index = (++this._index);

			xm.assertVar(group.name, 'string', 'group.name');

			if (this.groups.has(group.name)) {
				throw new Error('group.name collision on ' + group.name);
			}
			this.groups.set(group.name, group);
		}

		applyOptions(argv:any):ExposeContext {
			argv = optimist.parse(argv);
			var ctx = new ExposeContext(this, argv, null);

			ctx.getOptNames(true).forEach((name:string) => {
				var opt = this.options.get(name);
				if (opt.apply) {
					opt.apply(ctx.getOpt(name), ctx);
				}
			});
			return ctx;
		}

		init():void {
			if (this._isInit) {
				return;
			}
			this._isInit = true;

			xm.valuesOf(this.options).forEach((option:ExposeOption) => {
				if (option.short) {
					optimist.alias(option.name, option.short);
				}
				// TODO get rid of optimist's defaults
			});

			xm.valuesOf(this.groups).forEach((group:xm.ExposeGroup) => {
				this.validateOptions(group.options);
			});

			xm.valuesOf(this.commands).forEach((cmd:xm.ExposeCommand) => {
				this.validateOptions(cmd.options);
			});
		}

		validateOptions(opts:string[]):void {
			opts.forEach((name:string) => {
				xm.assert(this.options.has(name), 'undefined option {a}', name);
			});
		}

		exit(code:number):void {
			if (code !== 0) {
				this.reporter.output.ln().error('Closing with exit code ' + code).clear();
			}
			else {
				// this.reporter.output.ln().success('Closing with exit code ' + code).clear();
			}
			// exitProcess(code);
		}

		// execute and exit
		executeArgv(argvRaw:any, alt?:string, exitAfter:boolean = true):void {
			Q(this.executeRaw(argvRaw, alt)).then((res:ExposeResult) => {
				if (this.end) {
					return Q(this.end.call(null, res)).then((over:ExposeResult) => {
						return over || res;
					});
				}
				return res;
			}).then((res:ExposeResult) => {
				if (res.error) {
					throw(res.error);
				}
				if (exitAfter) {
					this.exit(res.code);
				}
			}).fail((err) => {
				// TODO what to do? with final error?
				if (err.stack) {
					this.reporter.output.span(err.stack).clear();
				}
				else {
					this.reporter.output.error(err.toString()).clear();
				}
				this.exit(1);
			});
		}

		// parse and execute args, promise result
		executeRaw(argvRaw:any, alt?:string):Q.Promise<ExposeResult> {
			this.init();

			if (!alt || !this.commands.has(alt)) {
				alt = 'help';
			}

			var options:ExposeOption[] = xm.valuesOf(this.options);
			var opt:ExposeOption;
			var i:number, ii:number;

			var ctx = this.applyOptions(argvRaw);
			if (!ctx) {
				return this.executeCommand(alt);
			}

			// command options (option that takes priority, like --version etc)
			for (i = 0, ii = options.length; i < ii; i++) {
				opt = options[i];
				if (opt.command && ctx.hasOpt(opt.name, true)) {
					return this.executeCommand(opt.command, ctx);
				}
			}

			// clean argv 'bin' padding
			// node
			var cmd = ctx.shiftArg();
			// script
			cmd = ctx.shiftArg();
			if (ctx.numArgs === 0) {
				// this.output.warning('undefined command').clear();
				return this.executeCommand(alt, ctx);
			}
			// command
			cmd = ctx.shiftArg();
			if (this.commands.has(cmd)) {
				// actual command
				return this.executeCommand(cmd, ctx);
			}
			else {
				this.reporter.output.ln().warning('command not found: ' + cmd).clear();
				return this.executeCommand('help', ctx);
			}
		}

		// execute command, promise result
		executeCommand(name:string, ctx:xm.ExposeContext = null):Q.Promise<ExposeResult> {
			this.init();

			if (!this.commands.has(name)) {
				return Q({
					code: 1,
					error: new Error('unknown command ' + name)
				});
			}
			var cmd:ExposeCommand = this.commands.get(name);

			var defer:Q.Deferred<ExposeResult> = Q.defer();

			Q.resolve().then(() => {
				if (this.before) {
					return Q(this.before(ctx));
				}
				return null;
			}).then(() => {
				return Q(cmd.execute(ctx));
			}).then(() => {
				if (this.after) {
					return Q(this.after(ctx));
				}
				return null;
			}).then(() => {
				return {
					code: 0,
					ctx: ctx
				};
			}, (err:any) => {
				xm.log.error('err', err);
				return {
					code: (err.code && err.code !== 0 ? err.code : 1),
					error: err,
					ctx: ctx
				};
			}).done((ret:ExposeResult) => {
				defer.resolve(ret);
			});

			return defer.promise;
		}
	}
}
