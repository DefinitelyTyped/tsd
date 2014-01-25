/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="../_ref.d.ts" />
/// <reference path="../collection.ts" />
/// <reference path="../StyledOut.ts" />
/// <reference path="../expose/Expose.ts" />

/*
 Expose: cli command manager and help generator
 */
module xm {
	'use strict';

	var jsesc = require('jsesc');
	var ministyle = <typeof MiniStyle> require('ministyle');
	var miniwrite = <typeof MiniWrite> require('miniwrite');
	var minitable = require('minitable');

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

	// TODO swap ExposeLevel class for enum
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

		// TODO figure-out proper way to specify/rank detail level
		printCommands(level:string):void {
			var builder = minitable.getBuilder(this.output.getWrite(), this.output.getStyle());
			xm.assertVar(builder, 'object', 'builder');

			var headers = builder.createType('headers', [
				{ name: 'title'},
			]);
			var divider = builder.createType('divider', [
				{ name: 'main'},
			]);
			var commands = builder.createType('commands', [
				{ name: 'command'},
				{ name: 'short'},
				{ name: 'label'}
			], {
				inner: '   ',
				rowSpace: 0
			});

			// start rows
			headers.init();
			divider.init();
			commands.init();

			var commandOptNames:string[] = [];
			var globalOptNames:string[] = [];
			var detailPad:string = this.output.nibs.decl;

			var allCommands = xm.keysOf(this.expose.commands);
			var allGroups = xm.valuesOf(this.expose.groups);

			var sortOptionName = (one:string, two:string) => {
				return exposeSortOption(this.expose.options.get(one), this.expose.options.get(two));
			};

			var optKeys = xm.keysOf(this.expose.options).sort(sortOptionName);

			var firstHeader = true;
			var addHeader = (title:string) => {
				if (!firstHeader) {
					addDivider();
				}
				builder.closeAll();
				firstHeader = false;
				headers.next();
				headers.row.title.out.accent('>> ').plain(title).line();
				addDivider();
			};

			var addDivider = () => {
				builder.closeAll();
				divider.next();
				divider.row.main.out.line('   ');
			};

			var addOption = (name:string) => {
				commands.next();
				var option:ExposeOption = this.expose.options.get(name);
				var command = commands.row.command.out;
				var label = commands.row.label.out;
				if (!option) {
					command.indent(1).sp().accent('--').plain(name).ln();
					label.indent(1).warning('<undefined>').ln();
				}
				else {
					command.indent(1).sp().accent('--').plain(name);
					if (option.placeholder) {
						command.sp().muted('<').plain(option.placeholder).muted('>');
					}
					command.ln();

					if (option.short) {
						commands.row.short.out.accent('-').line(option.short);
					}

					label.accent(' > ').plain(option.description);
					label.sp().accent('(').plain(option.type);
					label.plain((option.default ? ', default: ' + option.default : ''));
					label.accent(')').ln();

					if (option.enum.length > 0) {
						label.indent().accent(' [ ').plain(option.enum.map((value:any) => {
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
						}).join(', ')).accent(' ]').ln();
					}
				}

				addNote(option.note);
			};

			var addCommand = (cmd:ExposeCommand, group:ExposeGroup) => {
				if (cmd.hidden) {
					return;
				}
				commands.next();
				var command = commands.row.command.out;
				command.indent(1).plain(cmd.name);
				if (cmd.variadic.length > 0) {
					command.sp().muted('<').plain(cmd.variadic.join(', ')).muted('>');
				}
				command.ln();

				commands.row.label.out.line(cmd.label);

				addNote(cmd.note);

				cmd.options.filter((name:string) => {
					return (commandOptNames.indexOf(name) < 0) && (globalOptNames.indexOf(name) < 0);
				}).sort(sortOptionName).forEach((name:string) => {
					addOption(name);
				});
			};

			var addNote = (note:string[]) => {
				if (note && note.length > 0) {
					note.forEach((note:string) => {
						commands.row.label.out.indent().accent(' : ').line(String(note));
					});
				}
			};

			optKeys.forEach((name:string) => {
				var option:ExposeOption = this.expose.options.get(name);
				if (option.command) {
					// addOption(option);
					commandOptNames.push(option.name);
				}
			});

			optKeys.forEach((name:string) => {
				var option:ExposeOption = this.expose.options.get(name);
				if (option.global && !option.command) {
					// addOption(option);
					globalOptNames.push(option.name);
				}
			});

			if (allGroups.length > 0) {
				xm.valuesOf(this.expose.groups).sort(exposeSortGroup).forEach((group:ExposeGroup) => {

					var contents = xm.valuesOf(this.expose.commands).filter((cmd:ExposeCommand) => {
						return cmd.groups.indexOf(group.name) > -1;
					});
					if (contents.length > 0) {
						addHeader(group.label);
						contents.sort(group.sorter).forEach((cmd:ExposeCommand) => {
							addCommand(cmd, group);

							var i = allCommands.indexOf(cmd.name);
							if (i > -1) {
								allCommands.splice(i, 1);
							}
						});

						if (group.options.length > 0) {
							// addDivider();

							group.options.filter((name:string) => {
								return (commandOptNames.indexOf(name) < 0) && (globalOptNames.indexOf(name) < 0);
							}).sort(sortOptionName).forEach((name:string) => {
								addOption(name);
							});
						}
					}
					// xm.eachProp(expose.commands.keys().sort(), (name) => {});
				});
			}

			if (allCommands.length > 0) {
				addHeader('other commands');

				allCommands.forEach((name) => {
					addCommand(this.expose.commands.get(name), this.expose.mainGroup);
				});
			}

			if (commandOptNames.length > 0 && globalOptNames.length > 0) {
				addHeader('global options');

				if (commandOptNames.length > 0) {
					commandOptNames.forEach((name:string) => {
						addOption(name);
					});
				}

				if (globalOptNames.length > 0) {
					globalOptNames.forEach((name:string) => {
						addOption(name);
					});
				}
			}
			builder.flush();
		}
	}
}
