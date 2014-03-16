/// <reference path="../_ref.d.ts" />

import jsesc = require('jsesc');
import Promise = require('bluebird');
import exitProcess = require('exit');

import assert = require('../assert');
import assertVar = require('../assertVar');
import typeOf = require('../typeOf');
import collection = require('../collection');
import StyledOut = require('../lib/StyledOut');
import objectUtils = require('../objectUtils');

import ExposeCommand = require('./ExposeCommand');
import ExposeGroup = require('./ExposeGroup');
import ExposeOption = require('./ExposeOption');
import ExposeContext = require('./ExposeContext');
import ExposeResult = require('./ExposeResult');
import ExposeHandle = require('./ExposeHandle');
import ExposeHook = require('./ExposeHook');

import ExposeFormatter = require('./ExposeFormatter');
import sorter = require('./sorter');

// TODO ditch node-exit if node ever get fixed..
import minimist = require('minimist');

/*
 Expose: cli command manager, wraps optimist with better usage generator and other utils
 */
// TODO add detail level switch / more/less flag
// TODO add per-command sub-help like npm
// TODO add feature for printable placeholder sub-info (format etc)
// TODO unify Actions and Commands (same thing really)
// TODO implement Actions/Commands queue
class Expose {

	commands = new Map<string, ExposeCommand>();
	options = new Map<string, ExposeOption>();
	groups = new Map<string, ExposeGroup>();
	mainGroup = new ExposeGroup();

	private _isInit = false;
	private _index = 0;

	// TODO rename 'reporter' properly
	reporter: ExposeFormatter;

	before: ExposeHook;
	after: ExposeHook;
	end: ExposeHandle;

	constructor(output: StyledOut = null) {
		this.reporter = new ExposeFormatter(this, output);

		objectUtils.defineProps(this, ['commands', 'options', 'groups', 'mainGroup'], {
			writable: false,
			enumerable: false
		});
	}

	defineOption(build: (opt: ExposeOption) => void) {
		var opt = new ExposeOption();
		build(opt);

		if (opt.type === 'flag' && typeOf.isUndefined(opt.default)) {
			opt.default = false;
		}

		assertVar(opt.name, 'string', 'opt.name');

		if (this.options.has(opt.name)) {
			throw new Error('opt.name collision on ' + opt.name);
		}
		this.options.set(opt.name, opt);
	}

	defineCommand(build: (cmd: ExposeCommand) => void): void {
		var cmd = new ExposeCommand();
		build(cmd);
		cmd.index = (++this._index);

		assertVar(cmd.name, 'string', 'build.name');

		if (this.commands.has(cmd.name)) {
			throw new Error('cmd.name collision on ' + cmd.name);
		}
		this.commands.set(cmd.name, cmd);
	}

	defineGroup(build: (group: ExposeGroup) => void): void {
		var group = new ExposeGroup();
		build(group);
		group.index = (++this._index);

		assertVar(group.name, 'string', 'group.name');

		if (this.groups.has(group.name)) {
			throw new Error('group.name collision on ' + group.name);
		}
		this.groups.set(group.name, group);
	}

	applyOptions(argv: any): ExposeContext {
		var opts: minimist.Opts = {
			string: [],
			boolean: [],
			alias: {},
			default: {}
		};

		this.options.forEach((option: ExposeOption) => {
			if (option.short) {
				opts.alias[option.name] = [option.short];
			}
			if (option.default) {
				opts.default[option.name] = option.default;
			}
			// we parse our own types
			if (option.type !== 'number') {
				opts.string.push(option.name);
			}
		});

		argv = minimist(argv, opts);
		var ctx = new ExposeContext(this, argv, null);

		ctx.getOptNames(true).forEach((name: string) => {
			var opt = this.options.get(name);
			if (opt.apply) {
				opt.apply(ctx.getOpt(name), ctx);
			}
		});
		return ctx;
	}

	init(): void {
		if (this._isInit) {
			return;
		}
		this._isInit = true;

		this.groups.forEach((group: ExposeGroup) => {
			this.validateOptions(group.options);
		});

		this.commands.forEach((cmd: ExposeCommand) => {
			this.validateOptions(cmd.options);
		});
	}

	validateOptions(opts: string[]): void {
		opts.forEach((name: string) => {
			assert(this.options.has(name), 'undefined option {a}', name);
		});
	}

	exit(code: number): void {
		if (code !== 0) {
			this.reporter.output.ln().error('Closing with exit code ' + code).clear();

			// only exit if bad (leave services etc in normal use)
			exitProcess(code);
		}
		else {
			// this.reporter.output.ln().success('Closing with exit code ' + code).clear();
		}
	}

	// execute and exit
	executeArgv(argvRaw: any, alt?: string, exitAfter: boolean = true): void {
		this.executeRaw(argvRaw, alt).then((res: ExposeResult) => {
			if (this.end) {
				return Promise.cast(this.end.call(null, res)).then((over: ExposeResult) => {
					return over || res;
				});
			}
			return Promise.cast(res);
		}).then((res: ExposeResult) => {
			if (res.error) {
				throw(res.error);
			}
			if (exitAfter) {
				this.exit(res.code);
			}
		}).catch((err) => {
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
	executeRaw(argvRaw: any, alt?: string): Promise<ExposeResult> {
		this.init();

		if (!alt || !this.commands.has(alt)) {
			alt = 'help';
		}

		var options: ExposeOption[] = collection.valuesOf(this.options);
		var opt: ExposeOption;
		var i: number, ii: number;

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
	executeCommand(name: string, ctx: ExposeContext = null): Promise<ExposeResult> {
		this.init();

		if (!this.commands.has(name)) {
			return Promise.cast({
				ctx: ctx,
				code: 1,
				error: new Error('unknown command ' + name)
			});
		}
		var cmd: ExposeCommand = this.commands.get(name);

		return Promise.attempt(() => {
			if (this.before) {
				return Promise.cast(this.before(ctx));
			}
		}).then(() => {
			return Promise.cast(cmd.execute(ctx));
		}).then(() => {
			if (this.after) {
				return Promise.cast(this.after(ctx));
			}
			return null;
		}).then(() => {
			return {
				code: 0,
				ctx: ctx
			};
		}).catch((err: any) => {
			return {
				code: (err.code && err.code !== 0 ? err.code : 1),
				error: err,
				ctx: ctx
			};
		});
	}
}

export = Expose;
