/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../_ref.d.ts" />
///<reference path="../KeyValueMap.ts" />
///<reference path="../iterate.ts" />
///<reference path="../callAsync.ts" />
///<reference path="../assertVar.ts" />
///<reference path="../ObjectUtil.ts" />
///<reference path="../io/Logger.ts" />
///<reference path="../../../typings/easy-table/easy-table.d.ts" />

module xm {
	'use strict';

	var optimist = require('optimist');
	var Q:typeof Q = require('q');
	var exitProcess:(code:number) => void = require('exit');
	var Table:EasyTableStatic = require('easy-table');

	export interface ExposeAction {
		(args:any):Q.Promise<any>;
	}

	export interface ExposeBuild {
		(cmd:ExposeCommand):void;
	}

	export interface ExposeBuildGroup {
		(group:ExposeGroup):void;
	}

	export interface ExposeSorter {
		(one:ExposeCommand, two:ExposeCommand):number;
	}

	export interface ExposeResult {
		code:number;
		error:ExposeError;
	}

	export interface ExposeError extends Error {
	}

	export function exposeSortIndex(one:ExposeCommand, two:ExposeCommand):number {
		if (one.index < two.index) {
			return -1;
		}
		else if (one.index > two.index) {
			return 1;
		}
		if (one.id < two.id) {
			return -1;
		}
		else if (one.id > two.id) {
			return 1;
		}
		return 0;
	}

	export function exposeSortHasElem(one:any[], two:any[], elem:any):number {
		var oneI = one.indexOf(elem) > -1;
		var twoI = two.indexOf(elem) > -1;
		if (oneI && !twoI) {
			return -1;
		}
		else if (!oneI && twoI) {
			return 1;
		}
		return 0;
	}

	export function exposeSortId(one:ExposeCommand, two:ExposeCommand):number {
		if (one.id < two.id) {
			return -1;
		}
		else if (one.id > two.id) {
			return 1;
		}
		if (one.index < two.index) {
			return -1;
		}
		else if (one.index > two.index) {
			return 1;
		}
		return 0;
	}

	export function exposeSortGroup(one:ExposeGroup, two:ExposeGroup):number {
		if (one.index < two.index) {
			return -1;
		}
		else if (one.index > two.index) {
			return 1;
		}
		if (one.id < two.id) {
			return -1;
		}
		else if (one.id > two.id) {
			return 1;
		}
		return 0;
	}

	export class ExposeCommand {
		id:string;
		execute:ExposeAction;
		index:number;

		label:string;
		options:string[] = [];
		variadic:string[] = [];
		groups:string[] = [];

		constructor() {
		}
	}

	export class ExposeGroup {
		id:string;
		label:string;
		index:number;
		sorter:ExposeSorter = exposeSortIndex;
		options:string[] = [];

		constructor() {
		}
	}

	//TODO decide on object style..

	export interface ExposeOption {
		name:string;
		description:string;
		short:string;
		type:string;
		placeholder:string;
		default:any;
		command:string;
		global:boolean;
	}

	/*
	 Expose: cli command manager, wraps optimist with better usage generator and other utils
	 */
	//TODO add per-command sub-help like npm
	//TODO add feature for printable placeholder sub-info (format etc)
	export class Expose {

		private _commands = new KeyValueMap();
		private _options = new KeyValueMap();
		private _groups = new KeyValueMap();
		private _isInit = false;
		private _nodeBin = false;
		private _index = 0;
		private _mainGroup = new ExposeGroup();
		log = xm.getLogger('Expose');

		constructor(public title:string = '') {
			this.createCommand('help', (cmd:ExposeCommand) => {
				cmd.label = 'Display usage help';
				cmd.groups = ['help'];
				cmd.execute = (args:any) => {
					this.printCommands();
					return null;
				};
			});

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

			this.log.showLog = false;
		}

		defineOption(data:ExposeOption) {
			if (this._options.has(data.name)) {
				throw new Error('option id collision on ' + data.name);
			}
			this._options.set(data.name, data);
		}

		createCommand(id:string, build:ExposeBuild) {
			xm.assertVar('id', id, 'string');

			if (this._commands.has(id)) {
				throw new Error('id collision on ' + id);
			}
			var cmd = new ExposeCommand();
			cmd.id = id;
			cmd.index = (++this._index);
			build(cmd);
			this._commands.set(id, cmd);
		}

		createGroup(id:string, build:ExposeBuildGroup):void {
			xm.assertVar('id', id, 'string');
			if (this._groups.has(id)) {
				throw new Error('id collision on ' + id);
			}
			var group = new ExposeGroup();
			group.id = id;
			group.index = (++this._index);
			build(group);
			this._groups.set(id, group);
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
				if (xm.ObjectUtil.hasOwnProp(option, 'default')) {
					optimist.default(option.name, option.default);
				}
			});
		}

		exit(code:number):void {
			exitProcess(code);
		}

		//execute and exit
		executeArgv(argvRaw:any, alt?:string, exitAfter:boolean = true):void {
			this.execArgv(argvRaw, alt).then((result:ExposeResult) => {
				if (result.error) {
					throw(result.error);
				}
				if (exitAfter) {
					this.exit(result.code);
				}
			}).fail((err) => {
				xm.log.error(err);
				this.exit(1);
			});
		}

		//pasre and execute args, promise result
		execArgv(argvRaw:any, alt?:string):Q.Promise<ExposeResult> {
			this.init();

			this._nodeBin = argvRaw[0] === 'node';

			var options:ExposeOption[] = this._options.values();
			var opt:ExposeOption;
			var i:number, ii:number;

			var argv = optimist.parse(argvRaw);

			//defaults
			if (!argv || argv._.length === 0) {
				if (alt && this._commands.has(alt)) {
					return this.execute(alt, argv);
				}
				else {
					return this.execute('help', argv);
				}
			}

			//command options (option that takes priority, like --version etc)
			for (i = 0, ii = options.length; i < ii; i++) {
				opt = options[i];
				if (opt.command && argv[opt.name]) {
					//xm.log('command opt ' + name);
					return this.execute(opt.command, argv);
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
					return this.execute(alt, argv);
				}
				else {
					xm.log.warn('undefined command');
					xm.log('');
					return this.execute('help', argv);
				}
			}
			else if (this._commands.has(cmd)) {
				// actual command
				return this.execute(cmd, argv);
			}
			else {
				xm.log.warn('command not found: ' + cmd);
				xm.log('');
				return this.execute('help', argv, false);
			}
		}

		//execute command
		execute(id:string, args:any = null, head:boolean = false):Q.Promise<ExposeResult> {
			this.init();

			if (!this._commands.has(id)) {
				xm.log.error('\nunknown command ' + id + '\n');
				return Q({
					code: 1,
					err: new Error('unknown command ' + id)
				});
			}
			if (head) {
				xm.log('\n-> ' + id + '\n');
			}
			var f:ExposeCommand = this._commands.get(id);

			return Q(f.execute.call(f, args)).then(() => {
				return {
					code: 0
				};
			}, (err) => {
				return {
					code: (err.code && err.code > 0) ? err.code : 1,
					err: err
				};
			});
		}

		printCommands():void {
			if (this.title) {
				xm.log(this.title + '\n');
			}

			var optionString = (option:ExposeOption):string => {
				var placeholder = option.placeholder ? ' <' + option.placeholder + '>' : '';
				return (option.short ? '-' + option.short + ', ' : '') + '--' + option.name + placeholder;
			};

			var commands = new Table();

			var commandOptNames:string[] = [];
			var globalOptNames:string[] = [];
			var commandPadding:string = '   ';
			var optPadding:string = '      ';

			var optKeys = this._options.keys().sort();

			var addOption = (name:string) => {
				var option = this._options.get(name, null);
				if (!option) {
					commands.cell('one', optPadding + '--' + name);
					commands.cell('two', '<undefined>');
				}
				else {
					commands.cell('one', optPadding + optionString(option));
					commands.cell('two', option.description + ' (' + option.type + ')');
				}
				commands.newRow();
			};

			var addCommand = (cmd:ExposeCommand, group:ExposeGroup) => {
				var usage = cmd.id;
				if (cmd.variadic.length > 0) {
					usage += ' <' + cmd.variadic.join(', ') + '>';
				}
				commands.cell('one', commandPadding + usage);
				commands.cell('two', cmd.label);
				commands.newRow();

				xm.eachProp(cmd.options, (name:string) => {
					var option:ExposeOption = this._options.get(name);
					if (commandOptNames.indexOf(name) < 0 && group.options.indexOf(name) < 0) {
						addOption(name);
					}
				});
				//commands.newRow();
			};

			var allCommands = this._commands.keys();
			var allGroups = this._groups.values();

			xm.eachElem(optKeys, (name:string) => {
				var option:ExposeOption = this._options.get(name);
				if (option.command) {
					//addOption(option);
					commandOptNames.push(option.name);
				}
			});
			//commands.newRow();
			xm.eachElem(optKeys, (name:string) => {
				var option:ExposeOption = this._options.get(name);
				if (option.global && !option.command) {
					//addOption(option);
					globalOptNames.push(option.name);
				}
			});

			if (allGroups.length > 0) {
				xm.eachProp(this._groups.values().sort(exposeSortGroup), (group:ExposeGroup) => {
					commands.cell('one', group.label + '\n--------');
					commands.newRow();

					this._commands.values().filter((cmd:ExposeCommand) => {
						return cmd.groups.indexOf(group.id) > -1;

					}).sort(group.sorter).forEach((cmd:ExposeCommand) => {
						addCommand(cmd, group);

						var i = allCommands.indexOf(cmd.id);
						if (i > -1) {
							allCommands.splice(i, 1);
						}
					});

					if (group.options.length > 0) {
						commands.cell('one', '--------');
						commands.newRow();
						xm.eachProp(group.options, (name:string) => {
							var option = this._options.get(name);
							if (commandOptNames.indexOf(name) < 0) {
								addOption(name);
							}
						});
					}
					commands.newRow();
					//xm.eachProp(this._commands.keys().sort(), (id) => {});
				});
			}

			if (allCommands.length > 0) {
				commands.cell('one', 'Other commands\n--------');
				commands.newRow();
				allCommands.forEach((id) => {
					addCommand(this._commands.get(id), this._mainGroup);
				});
				commands.newRow();
			}

			if (commandOptNames.length > 0 && globalOptNames.length > 0) {
				commands.cell('one', 'Global options\n--------');
				commands.newRow();
				if (commandOptNames.length > 0) {
					xm.eachElem(commandOptNames, (name:string) => {
						addOption(name);
					});
				}

				if (globalOptNames.length > 0) {
					xm.eachElem(globalOptNames, (name:string) => {
						addOption(name);
					});
				}
				commands.newRow();
			}
			//now output

			//TODO get rid of this nasty trim
			xm.log(commands.print().replace(/\s*$/, ''));
		}

		get nodeBin():boolean {
			return this._nodeBin;
		}
	}
}
