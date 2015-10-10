/// <reference path="../_ref.d.ts" />

'use strict';

import jsesc = require('jsesc');
import Promise = require('bluebird');
import exitProcess = require('exit');

import assert = require('../xm/assert');
import assertVar = require('../xm/assertVar');
import typeOf = require('../xm/typeOf');
import collection = require('../xm/collection');
import StyledOut = require('../xm/lib/StyledOut');
import objectUtils = require('../xm/objectUtils');

import Command = require('./Command');
import Group = require('./Group');
import Option = require('./Option');
import Context = require('./Context');
import Result = require('./Result');
import ResultHandle = require('./ResultHandle');
import ContextHandle = require('./ContextHandle');

import Formatter = require('./Formatter');
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

	commands = new collection.Hash<Command>();
	options = new collection.Hash<Option>();
	groups = new collection.Hash<Group>();
	mainGroup = new Group();

	private _isInit = false;
	private _index = 0;

	// TODO rename 'reporter' properly
	reporter: Formatter;

	before: ContextHandle;
	after: ContextHandle;
	end: ResultHandle;

	constructor(output: StyledOut = null) {
		this.reporter = new Formatter(this, output);

		objectUtils.defineProps(this, ['commands', 'options', 'groups', 'mainGroup'], {
			writable: false,
			enumerable: false
		});
	}

	defineOption(build: (opt: Option) => void) {
		var opt = new Option();
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

	defineCommand(build: (cmd: Command) => void): void {
		var cmd = new Command();
		build(cmd);
		cmd.index = (++this._index);

		assertVar(cmd.name, 'string', 'build.name');

		if (this.commands.has(cmd.name)) {
			throw new Error('cmd.name collision on ' + cmd.name);
		}
		this.commands.set(cmd.name, cmd);
	}

	defineGroup(build: (group: Group) => void): void {
		var group = new Group();
		build(group);
		group.index = (++this._index);

		assertVar(group.name, 'string', 'group.name');

		if (this.groups.has(group.name)) {
			throw new Error('group.name collision on ' + group.name);
		}
		this.groups.set(group.name, group);
	}

	applyOptions(argv: any): Context {
		var opts: minimist.Opts = {
			string: [],
			boolean: [],
			alias: {},
			default: {}
		};

		this.options.forEach((option: Option) => {
			if (option.short) {
				opts.alias[option.name] = [option.short];
			}
			if (option.default) {
				opts.default[option.name] = option.default;
			}
			// we parse our own types
			if (option.type === 'flag') {
				opts.boolean.push(option.name);
			}
			else if (option.type !== 'number') {
				opts.string.push(option.name);
			}
		});

		argv = minimist(argv, opts);
		var ctx = new Context(this, argv, null);

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

		this.groups.forEach((group: Group) => {
			this.validateOptions(group.options);
		});

		this.commands.forEach((cmd: Command) => {
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
		this.executeRaw(argvRaw, alt).then((res: Result) => {
			if (this.end) {
				return Promise.resolve(this.end.call(null, res)).then((over: Result) => {
					return over || res;
				});
			}
			return Promise.resolve(res);
		}).then((res: Result) => {
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
	executeRaw(argvRaw: any, alt?: string): Promise<Result> {
		this.init();

		if (!alt || !this.commands.has(alt)) {
			alt = 'help';
		}

		var options: Option[] = this.options.values();
		var opt: Option;
		var i: number, ii: number;

		var ctx = this.applyOptions(argvRaw);
		if (!ctx) {
			return this.executeCommand(alt);
		}

		// command options (option that takes priority, like --version etc)
		for (i = 0, ii = options.length; i < ii; i++) {
			opt = options[i];
			if (opt.command && ctx.hasOpt(opt.name, true) && ctx.getOpt(opt.name)) {
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
	executeCommand(name: string, ctx: Context = null): Promise<Result> {
		this.init();

		if (!this.commands.has(name)) {
			return Promise.resolve({
				ctx: ctx,
				code: 1,
				error: new Error('unknown command ' + name)
			});
		}
		var cmd: Command = this.commands.get(name);

		return Promise.attempt(() => {
			if (this.before) {
				return Promise.resolve(this.before(ctx));
			}
		}).then(() => {
			return Promise.resolve(cmd.execute(ctx));
		}).then(() => {
			if (this.after) {
				return Promise.resolve(this.after(ctx));
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
