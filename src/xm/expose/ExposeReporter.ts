/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../_ref.d.ts" />
///<reference path="../../../typings/easy-table/easy-table.d.ts" />
///<reference path="../io/StyledOut.ts" />
///<reference path="../expose/Expose.ts" />

/*
 Expose: cli command manager and help generator
 */
module xm {
	'use strict';

	var jsesc = require('jsesc');
	//TODO ditch easy-table
	var Table:EasyTableStatic = require('easy-table');
	var minitable = require('../lib/minitable/minitable');

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

	export function exposeSortOption(one:ExposeOption, two:ExposeOption):number {
		if (one.short && !two.short) {
			return -1;
		}
		if (!one.short && two.short) {
			return 1;
		}
		if (one.short && two.short) {
			if (one.short.toLowerCase() < two.short.toLowerCase()) {
				return -1;
			}
			else if (one.short.toLowerCase() > two.short.toLowerCase()) {
				return 1;
			}
		}
		if (one.name.toLowerCase() < two.name.toLowerCase()) {
			return -1;
		}
		else if (one.name.toLowerCase() > two.name.toLowerCase()) {
			return 1;
		}
		return 0;
	}

	//TODO swap for enum
	export class ExposeLevel {
		static min = -1;
		static med = 0;
		static max = 1;
	}

	/*
	 ExposeHelpPrinter: pretty print Expose info
	 */
	export class ExposeReporter {

		output:xm.StyledOut;
		expose:xm.Expose;

		constructor(expose:xm.Expose, output:xm.StyledOut = null) {
			xm.assertVar(expose, xm.Expose, 'expose');
			xm.assertVar(output, xm.StyledOut, 'output', true);
			this.expose = expose;
			this.output = (output || new xm.StyledOut());
		}

		//TODO replace easy-tables with layout that supports colored/wrapped/non-printable output
		//TODO figure-out proper way to specify/rank detail level
		printCommands(level:string):void {
			var optionString = (option:ExposeOption):string => {
				var placeholder = (option.placeholder ? ' <' + option.placeholder + '>' : '');
				return '--' + option.name + placeholder;
			};

			var commands = new Table();

			var commandOptNames:string[] = [];
			var globalOptNames:string[] = [];
			var commandPadding:string = '   ';
			var optPadding:string = '      ';
			var optPaddingHalf:string = ' : ';

			var sortOptionName = (one:string, two:string) => {
				return exposeSortOption(this.expose.options.get(one), this.expose.options.get(two));
			};

			var optKeys = this.expose.options.keys().sort(sortOptionName);

			var addHeader = (label:string) => {
				commands.cell('one', label);
				commands.newRow();
				addDivider();
			};

			var addDivider = () => {
				commands.cell('one', '--------');
				commands.cell('short', '----');
				commands.cell('two', '--------');
				commands.newRow();
			};

			var addOption = (name:string) => {
				var option:ExposeOption = this.expose.options.get(name, null);
				if (!option) {
					commands.cell('one', optPadding + '--' + name);
					commands.cell('two', optPaddingHalf + '<undefined>');
				}
				else {
					commands.cell('one', optPadding + optionString(option));
					if (option.short) {
						commands.cell('short', ' -' + option.short);
					}
					var desc = optPaddingHalf + option.description;
					desc += ' (' + option.type;
					desc += (option.default ? ', default: ' + option.default : '');
					desc += ')';
					commands.cell('two', desc);

					if (option.enum.length > 0) {
						commands.newRow();
						commands.cell('two', '   ' + option.enum.map((value:any) => {
							if (xm.isNumber(value)) {
								return value;
							}
							var str = ('' + value);
							if (/^[\w_-]*$/.test(str)) {
								return str;
							}
							return '\'' + jsesc(('' + value), {
								quotes: 'single'
							}) + '\'';
						}).join(','));

					}
				}
				commands.newRow();

				addNote(option.note);
			};

			var addCommand = (cmd:ExposeCommand, group:ExposeGroup) => {
				var usage = cmd.name;
				if (cmd.variadic.length > 0) {
					usage += ' <' + cmd.variadic.join(', ') + '>';
				}
				commands.cell('one', commandPadding + usage);
				commands.cell('two', cmd.label);
				commands.newRow();

				addNote(cmd.note);

				cmd.options.sort(sortOptionName).forEach((name:string) => {
					if (commandOptNames.indexOf(name) < 0 && group.options.indexOf(name) < 0) {
						addOption(name);
					}
				});
				//commands.newRow();
			};

			var addNote = (note:string[]) => {
				if (note && note.length > 0) {
					note.forEach((note:string) => {
						commands.cell('two', '   <' + note + '>');
						commands.newRow();
					});
				}
			};

			var allCommands = this.expose.commands.keys();
			var allGroups = this.expose.groups.values();

			optKeys.forEach((name:string) => {
				var option:ExposeOption = this.expose.options.get(name);
				if (option.command) {
					//addOption(option);
					commandOptNames.push(option.name);
				}
			});
			//commands.newRow();
			optKeys.forEach((name:string) => {
				var option:ExposeOption = this.expose.options.get(name);
				if (option.global && !option.command) {
					//addOption(option);
					globalOptNames.push(option.name);
				}
			});

			if (allGroups.length > 0) {
				this.expose.groups.values().sort(exposeSortGroup).forEach((group:ExposeGroup) => {
					addHeader(group.label);

					this.expose.commands.values().filter((cmd:ExposeCommand) => {
						return cmd.groups.indexOf(group.name) > -1;

					}).sort(group.sorter).forEach((cmd:ExposeCommand) => {
						addCommand(cmd, group);

						var i = allCommands.indexOf(cmd.name);
						if (i > -1) {
							allCommands.splice(i, 1);
						}
					});

					if (group.options.length > 0) {
						addDivider();
						group.options.sort(sortOptionName).forEach((name:string) => {
							if (commandOptNames.indexOf(name) < 0) {
								addOption(name);
							}
						});
					}
					commands.newRow();
					//xm.eachProp(expose.commands.keys().sort(), (name) => {});
				});
			}

			if (allCommands.length > 0) {
				addHeader('other commands');

				allCommands.forEach((name) => {
					addCommand(this.expose.commands.get(name), this.expose.mainGroup);
				});
				commands.newRow();
			}

			if (commandOptNames.length > 0 && globalOptNames.length > 0) {
				addHeader('global options');

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
