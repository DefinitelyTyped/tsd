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
///<reference path="../../../typings/DefinitelyTyped/easy-table/easy-table.d.ts" />

module xm {

	var optimist = require('optimist');
	var Table:EasyTableStatic = require('easy-table');

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
		global:bool;
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
	//TODO add per-command sub-help like npm
	//TODO add feature for printable placeholder sub-info (format etc)
	export class Expose {

		private _commands = new KeyValueMap();
		private _options = new KeyValueMap();
		private _isInit = false;
		private _nodeBin = false;

		constructor(public title?:string = '') {
			this.command('help', () => {

				this.printCommands();

			}, 'Display usage help');

			this.defineOption({
				name: 'help',
				short: 'h',
				description: 'Display usage help',
				type: 'flag',
				default: null,
				placeholder: null,
				command: 'help',
				global: true
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
			});

			xm.eachProp(this._commands.keys(), (id) => {
				this._commands.get(id).init();
			});
		}

		executeArgv(argvRaw:any, alt?:string) {
			this.init();

			this._nodeBin = argvRaw[0] === 'node';

			var options:ExposeOption[] = this._options.values();
			var opt:ExposeOption;
			var i:number, ii:number;

			var argv = optimist.parse(argvRaw);

			//defaults
			if (!argv || argv._.length === 0) {
				if (alt && this._commands.has(alt)) {
					this.execute(alt, argv);
				}
				else {
					this.execute('help', argv);
				}
				return;
			}

			//command options (option that takes priority, like --version etc)
			for (i = 0, ii = options.length; i < ii; i++) {
				opt = options[i];
				if (opt.command && argv[opt.name]) {
					//xm.log('command opt ' + name);
					this.execute(opt.command, argv);
					return;
				}
			}

			//clean argv 'bin' padding
			var cmd = argv._.shift();
			if (cmd === 'node') {
				//ditch "node <script>"
				argv._.shift();
			}
			cmd = argv._.shift();

			if (typeof cmd === 'undefined') {
				if (alt && this._commands.has(alt)) {
					xm.log.warn('undefined command, using default');
					xm.log('');
					this.execute(alt, argv);
				}
				else {
					xm.log.warn('undefined command');
					xm.log('');
					this.execute('help', argv);
				}
			}
			else if (this._commands.has(cmd)) {
				// actual command
				this.execute(cmd, argv);
			}
			else {
				xm.log.warn('command not found: ' + cmd);
				xm.log('');
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

			var optionString = (option:ExposeOption):string => {
				var placeholder = option.placeholder ? ' <' + option.placeholder + '>' : '';
				return (option.short ? '-' + option.short + ', ' : '') + '--' + option.name + placeholder;
			};

			var globalOpts:EasyTable = new Table();

			var commandOptNames:string[] = [];
			var globalOptNames:string[] = [];

			var commandPadding:string = '   ';
			var optPadding:string = '      ';

			var optKeys = this._options.keys().sort();
			var options:ExposeOption[] = this._options.values();
			xm.eachElem(optKeys, (name:string) => {
				var option:ExposeOption = this._options.get(name);
				if (option.command) {
					globalOpts.cell('one', optPadding + optionString(option));
					globalOpts.cell('two', option.description);
					globalOpts.newRow();
					commandOptNames.push(option.name);
				}
			});
			globalOpts.newRow();
			xm.eachElem(optKeys, (name:string) => {
				var option:ExposeOption = this._options.get(name);
				if (option.global && !option.command) {
					globalOpts.cell('one', optPadding + optionString(option));
					globalOpts.cell('two', option.description);
					globalOpts.newRow();
					globalOptNames.push(option.name);
				}
			});

			var commands:EasyTable = new Table();

			xm.eachProp(this._commands.keys().sort(), (id) => {
				var usage = id;
				var cmd = this._commands.get(id);
				if (cmd.variadic.length > 0) {
					usage += ' <' + cmd.variadic.join(', ') + '>';
				}

				commands.cell('one', commandPadding + usage);
				commands.cell('two', cmd.label);
				commands.newRow();

				xm.eachProp(cmd.options, (name:string) => {
					var option:ExposeOption = this._options.get(name);
					if (commandOptNames.indexOf(name) < 0) {
						commands.cell('one', optPadding + optionString(option));
						commands.cell('two', option.description);
						commands.newRow();
					}
				});
				commands.newRow();
			});

			xm.log('commands:\n----');
			xm.log(commands.print());

			if (globalOptNames.length > 0) {
				xm.log('global options:\n----');
				xm.log(globalOpts.print());
			}
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