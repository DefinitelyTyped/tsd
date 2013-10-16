/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../_ref.d.ts" />
///<reference path="../../../typings/easy-table/easy-table.d.ts" />
///<reference path="../KeyValueMap.ts" />
///<reference path="../iterate.ts" />
///<reference path="../callAsync.ts" />
///<reference path="../assertVar.ts" />
///<reference path="../ObjectUtil.ts" />
///<reference path="../Logger.ts" />
///<reference path="StyledOut.ts" />

/*
 Expose: cli command manager and help generator
 */
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

	export interface ExposeHook {
		(cmd:ExposeCommand, args:any):Q.Promise<void>;
	}

	export interface ExposeOptionApply {
		(value:any, option:any):void;
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
		if (one.name < two.name) {
			return -1;
		}
		else if (one.name > two.name) {
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
		if (one.name < two.name) {
			return -1;
		}
		else if (one.name > two.name) {
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
		if (one.name < two.name) {
			return -1;
		}
		else if (one.name > two.name) {
			return 1;
		}
		return 0;
	}

	export class ExposeCommand {
		name:string;
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
		name:string;
		label:string;
		index:number;
		sorter:ExposeSorter = exposeSortIndex;
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
		//enum:any[] = [];
		apply:ExposeOptionApply;
	}

	/*
	 Expose: cli command manager, wraps optimist with better usage generator and other utils
	 */
	//TODO add detail level switch
	//TODO add per-command sub-help like npm
	//TODO add more/less flag
	//TODO add feature for printable placeholder sub-info (format etc)
	export class Expose {

		private _commands = new KeyValueMap<ExposeCommand>();
		private _options = new KeyValueMap<ExposeOption>();
		private _groups = new KeyValueMap<ExposeGroup>();
		private _isInit = false;
		private _index = 0;
		private _mainGroup = new ExposeGroup();

		output:xm.StyledOut;

		before:ExposeHook;
		after:ExposeHook;

		constructor(public title:string = '', output:xm.StyledOut = null) {
			this.output = (output || new xm.StyledOut());

			this.createCommand((cmd:ExposeCommand) => {
				cmd.name = 'help';
				cmd.label = 'Display usage help';
				cmd.groups = ['help'];
				cmd.execute = (args:any) => {
					this.printCommands();
					return null;
				};
			});

			this.defineOption((opt:ExposeOption) => {
				opt.name = 'help';
				opt.short = 'h';
				opt.description = 'Display usage help';
				opt.type = 'flag';
				opt.command = 'help';
				opt.global = true;
			});

			xm.ObjectUtil.hidePrefixed(this);
		}

		defineOption(build:(opt:ExposeOption) => void) {
			var opt = new ExposeOption();
			build(opt);

			xm.assertVar(opt.name, 'string', 'opt.name');

			if (this._options.has(opt.name)) {
				throw new Error('opt.name collision on ' + opt.name);
			}
			this._options.set(opt.name, opt);
		}

		createCommand(build:ExposeBuild):void {
			var cmd = new ExposeCommand();
			build(cmd);
			cmd.index = (++this._index);

			xm.assertVar(cmd.name, 'string', 'build.name');

			if (this._commands.has(cmd.name)) {
				throw new Error('cmd.name collision on ' + cmd.name);
			}
			this._commands.set(cmd.name, cmd);
		}

		defineGroup(build:ExposeBuildGroup):void {
			var group = new ExposeGroup();
			build(group);
			group.index = (++this._index);

			xm.assertVar(group.name, 'string', 'group.name');

			if (this._groups.has(group.name)) {
				throw new Error('group.name collision on ' + group.name);
			}
			this._groups.set(group.name, group);
		}

		applyOptions(argv:any):any {
			var argv = optimist.parse(argv);

			Object.keys(argv).forEach((name:string) => {
				if (name !== '_' && this._options.has(name)) {
					var opt = this._options.get(name);
					if (opt.apply) {
						opt.apply(argv[name], argv);
					}
				}
			});

			return argv;
		}

		init():void {
			if (this._isInit) {
				return;
			}
			this._isInit = true;

			xm.eachProp(this._options.keys(), (name) => {
				var option:ExposeOption = this._options.get(name);
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
			if (code !== 0) {
				//this.output.line().error('Closing with exit code ' + code).clear();
				this.output.line().fail('error');
			}
			else {
				//this.output.line().success('Closing with exit code ' + code).clear();
				this.output.line().ok('bye!');
			}
			exitProcess(code);
		}

		//execute and exit
		executeArgv(argvRaw:any, alt?:string, exitAfter:boolean = true):void {
			this.executeRaw(argvRaw, alt).then((result:ExposeResult) => {
				if (result.error) {
					throw(result.error);
				}
				if (exitAfter) {
					this.exit(result.code);
				}
			}).fail((err) => {
				//TODO what to do? with final error?
				this.output.error(err.toString()).clear();
				this.exit(1);
			});
		}

		//parse and execute args, promise result
		executeRaw(argvRaw:any, alt?:string):Q.Promise<ExposeResult> {
			this.init();

			if (!alt || !this._commands.has(alt)) {
				alt = 'help';
			}

			var options:ExposeOption[] = this._options.values();
			var opt:ExposeOption;
			var i:number, ii:number;

			var argv = this.applyOptions(argvRaw);
			if (!argv) {
				return this.executeCommand(alt, argv);
			}

			//command options (option that takes priority, like --version etc)
			for (i = 0, ii = options.length; i < ii; i++) {
				opt = options[i];
				if (opt.command && argv[opt.name]) {
					return this.executeCommand(opt.command, argv);
				}
			}

			//clean argv 'bin' padding
			//node
			var cmd = argv._.shift();
			//script
			cmd = argv._.shift();
			//command
			cmd = argv._.shift();

			if (typeof cmd === 'undefined') {
				//this.output.warning('undefined command').clear();
				return this.executeCommand(alt, argv);
			}
			else if (this._commands.has(cmd)) {
				// actual command
				return this.executeCommand(cmd, argv);
			}
			else {
				this.output.line().warning('command not found: ' + cmd).clear();
				return this.executeCommand('help', argv);
			}
		}

		//execute command, promise result
		executeCommand(name:string, args:any = null):Q.Promise<ExposeResult> {
			this.init();

			if (!this._commands.has(name)) {
				return Q({
					code: 1,
					err: new Error('unknown command ' + name)
				});
			}
			var cmd:ExposeCommand = this._commands.get(name);

			var defer:Q.Deferred<ExposeResult> = Q.defer();

			Q.resolve().then(() => {
				if (this.before) {
					return Q(this.before(cmd, args));
				}
				return null;
			}).then(() => {
				return Q(cmd.execute(args));
			}).then(() => {
				if (this.after) {
					return Q(this.after(cmd, args));
				}
				return null;
			}).then(() => {
				return {
					code: 0
				};
			}, (err) => {
				return {
					code: (err.code && err.code > 0) ? err.code : 1,
					err: err
				};
			}).done((ret:ExposeResult) => {
				defer.resolve(ret);
			});

			return defer.promise;
		}

		printCommands():void {
			if (this.title) {
				this.output.accent(this.title).clear();
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
				var option:ExposeOption = this._options.get(name, null);
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
				var usage = cmd.name;
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
						return cmd.groups.indexOf(group.name) > -1;

					}).sort(group.sorter).forEach((cmd:ExposeCommand) => {
						addCommand(cmd, group);

						var i = allCommands.indexOf(cmd.name);
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
					//xm.eachProp(this._commands.keys().sort(), (name) => {});
				});
			}

			if (allCommands.length > 0) {
				commands.cell('one', 'Other commands\n--------');
				commands.newRow();
				allCommands.forEach((name) => {
					addCommand(this._commands.get(name), this._mainGroup);
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

			//TODO get rid of this nasty trim (ditch easy-table)
			this.output.block(commands.print().replace(/\s*$/, ''));
		}
	}
}
