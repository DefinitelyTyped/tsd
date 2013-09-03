/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../_ref.ts" />
///<reference path="../KeyValueMap.ts" />
///<reference path="../iterate.ts" />
///<reference path="../callAsync.ts" />
///<reference path="../ObjectUtil.ts" />

module xm {

	function padLeft(str:string, len:number, char:string):string {
		str = String(str);
		char = String(char).charAt(0);
		while (str.length < len) {
			str = char + str;
		}
		return str;
	}

	function padRight(str:string, len:number, char:string):string {
		str = String(str);
		char = String(char).charAt(0);
		while (str.length < len) {
			str = str + char;
		}
		return str;
	}

	function repeat(str:string, len:number):string {
		return new Array(len).join(str);
	}

	var optimist = require('optimist');

	export interface ExposeAction extends Function{
		(args:any, done:(err) => void):void;
	}

	export interface ExposeOption {
		name:string;
		description:string;
		short:string;
		type:string;
		placeholder:string;
		default:any;
		command:string;
	}

	export class ExposeCommand {

		constructor(public id:string, public execute:ExposeAction, public label?:string, public options?:string[] = [], public variadic:string[] = []) {

		}

		init():void {

		}
	}

	/*
	 Expose: cli command manager, wraps optimist with better usage generator and other utils
	 */
	//TODO better support for global options; not only .command but also a .global
	//TODO add per-command sub-help like npm
	//TODO add feature for printable placeholder sub-info (format etc)
	export class Expose {

		private _commands = new KeyValueMap();
		private _options = new KeyValueMap();
		private _commandOpts:string[] = [];
		private _isInit = false;
		private _nodeBin = false;

		constructor(public title?:string = '') {
			this.command('help', () => {

				this.printCommands();

			}, 'usage help');

			this.defineOption({
				name: 'help',
				short: 'h',
				description: 'display usage help',
				type: 'flag',
				default: null,
				placeholder: null,
				command: 'help'
			});

			xm.ObjectUtil.hidePrefixed(this);
		}

		defineOption(data:ExposeOption) {
			if (this._options.has(data.name)) {
				throw new Error('option id collision on ' + data.name);
			}
			this._options.set(data.name, data);
		}

		command(id:string, def:(args:any) => void, label?:string, options?:any, variadic?:any) {
			if (this._commands.has(id)) {
				throw new Error('id collision on ' + id);
			}
			this._commands.set(id, new ExposeCommand(id, def, label, options, variadic));
		}

		init():void {
			if (this._isInit) {
				return;
			}
			this._isInit = true;

			xm.eachProp(this._options.keys(), (id) => {
				var option:ExposeOption = this._options.get(id);
				if (option.short) {
					optimist.alias(option.name, option.short);
				}
				if (option.type === 'flag') {
					optimist.boolean(option.name);
				}
				else if (option.type === 'string') {
					optimist.string(option.name);
				}
				if (option.hasOwnProperty('default')) {
					optimist.default(option.name, option.default);
				}
				if (option.command) {
					this._commandOpts.push(option.name);
				}
			});

			xm.eachProp(this._commands.keys(), (id) => {
				this._commands.get(id).init();
			});
		}

		executeArgv(argvRaw:any, alt?:string) {
			this.init();

			this._nodeBin = argvRaw[0] === 'node';

			var argv = optimist.parse(argvRaw);
			if (!argv || argv._.length === 0) {
				if (alt && this._commands.has(alt)) {
					this.execute(alt, argv);
				}
				else {
					this.execute('help', argv);
				}
				return;
			}

			for (var i = 0, ii = this._commandOpts.length; i < ii; i++) {
				var name = this._commandOpts[i];
				if (argv[name]) {
					//xm.log('command opt ' + name);
					this.execute(this._options.get(name).command, argv);
					return;
				}
			}

			var use = argv._.shift();
			if (use === 'node') {
				//ditch "node <script>"
				argv._.shift();
			}
			use = argv._.shift();

			if (typeof use === 'undefined') {
				if (alt && this._commands.has(alt)) {
					xm.log.warn('undefined command, using default');
					this.execute(alt, argv);
				}
				else {
					xm.log.warn('undefined command');
					this.execute('help', argv);
				}
			}
			else if (this._commands.has(use)) {
				// actual command
				this.execute(use, argv);
			}
			else {
				xm.log.warn('command not found: ' + use);
				this.execute('help', argv, false);
			}
		}

		execute(id:string, args:any = null, head:bool = false) {
			this.init();

			if (!this._commands.has(id)) {
				xm.log.error('\nunknown command ' + id + '\n');
				return;
			}
			if (head) {
				xm.log('\n-> ' + id + '\n');
			}
			var f:ExposeCommand = this._commands.get(id);
			f.execute.call(f, args);
		}

		//TODO clean ugly method (after fixing global options)
		printCommands():void {
			if (this.title) {
				xm.log(this.title + '\n');
			}

			if (this._commandOpts.length > 0) {
				xm.log('global options:\n');

				var opts = [];
				var maxTopOptionLen = 0;
				//TODO DRY options printing
				xm.eachProp(this._commandOpts.sort(), (name) => {
					var option:ExposeOption = this._options.get(name);
					var placeholder = option.placeholder ? ' <' + option.placeholder + '>' : '';
					var tmp = (option.short ? '-' + option.short + ', ' : '') + '--' + option.name + placeholder;
					opts.push({
						name: name,
						usage: tmp,
						option: option
					});
					maxTopOptionLen = Math.max(tmp.length, maxTopOptionLen);
				});
				xm.eachProp(opts, (opt) => {
					xm.log('  ' + padRight(opt.usage, maxTopOptionLen, ' ') + ' : ' + opt.option.description);
				});
				xm.log('');
			}

			xm.log('commands:\n');

			var maxCommandLen = 0;
			var maxOptionLen = 0;
			var commands = [];

			xm.eachProp(this._commands.keys().sort(), (id) => {
				var data = {
					id: id,
					label: id,
					cmd: this._commands.get(id),
					options: []
				};

				if (data.cmd.variadic.length > 0) {
					data.label += ' <' + data.cmd.variadic.join(', ') + '>';
				}

				maxCommandLen = Math.max(data.label.length, maxCommandLen);

				xm.eachProp(data.cmd.options, (name:string) => {
					var option:ExposeOption = this._options.get(name);
					var placeholder = option.placeholder ? ' <' + option.placeholder + '>' : '';
					var tmp = (option.short ? '-' + option.short + ', ' : '') + '--' + option.name + placeholder;

					maxOptionLen = Math.max(tmp.length, maxOptionLen);
					data.options.push({
						usage: tmp,
						option: option
					});

				});
				commands.push(data);
			});

			var padOpts = '    ';//repeat(' ', maxCommandLen + 2);

			xm.eachProp(commands, (data) => {
				xm.log('  ' + padRight(data.label, maxCommandLen, ' ') + ' : ' + data.cmd.label);

				xm.eachProp(data.options, (opt:any) => {
					xm.log(padOpts + padRight(opt.usage, maxOptionLen, ' ') + ' : ' + opt.option.description);
				});
			});
		}

		hasCommand(id:string):bool {
			return this._commands.has(id);
		}

		getCommand(id:string):xm.ExposeCommand {
			return this._commands.get(id);
		}

		get nodeBin():bool {
			return this._nodeBin;
		}
	}
}