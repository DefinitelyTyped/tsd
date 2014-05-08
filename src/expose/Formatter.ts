/// <reference path="../_ref.d.ts" />

'use strict';

/*
Expose: cli command manager and help generator
*/

import jsesc = require('jsesc');
import ministyle = require('ministyle');
import miniwrite = require('miniwrite');
var minitable = require('minitable');

import assertVar = require('../xm/assertVar');
import typeOf = require('../xm/typeOf');
import collection = require('../xm/collection');
import StyledOut = require('../xm/lib/StyledOut');

import Expose = require('./Expose');
import Group = require('./Group');
import Command = require('./Command');
import Option = require('./Option');
import Level = require('./Level');
import sorter = require('./sorter');

/*
 HelpPrinter: pretty print Expose info
 */
class Formatter {

	output: StyledOut;
	expose: Expose;

	constructor(expose: Expose, output: StyledOut = null) {
		assertVar(output, StyledOut, 'output', true);
		this.expose = expose;
		this.output = (output || new StyledOut());
	}

	// TODO figure-out proper way to specify/rank detail level
	printCommands(level: string): void {
		var builder = minitable.getBuilder(this.output.getWrite(), this.output.getStyle());
		assertVar(builder, 'object', 'builder');

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
		var lines = builder.createType('line', [
			{ name: 'label'}
		], {
			rowSpace: 0
		});
		var examples = builder.createType('examples', [
			{ name: 'command'},
			{ name: 'label'}
		], {
			inner: '   '
		});

		// start rows
		headers.init();
		divider.init();
		commands.init();
		lines.init();
		examples.init();

		var commandOptNames: string[] = [];
		var globalOptNames: string[] = [];
		var detailPad: string = this.output.nibs.decl;

		var allCommands = collection.keysOf(this.expose.commands);
		var allGroups = collection.valuesOf(this.expose.groups);

		var sortOptionName = (one: string, two: string) => {
			return sorter.sortOption(this.expose.options.get(one), this.expose.options.get(two));
		};

		var optKeys = collection.keysOf(this.expose.options).sort(sortOptionName);

		var firstHeader = true;
		var addHeader = (title: string) => {
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

		var addOption = (name: string) => {
			commands.next();
			var option: Option = this.expose.options.get(name);
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
					label.indent().accent(' [ ').plain(option.enum.map((value: any) => {
						if (typeOf.isNumber(value)) {
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

		var addCommand = (cmd: Command, group: Group) => {
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
			addExamples(cmd.examples);

			cmd.options.filter((name: string) => {
				return (commandOptNames.indexOf(name) < 0) && (globalOptNames.indexOf(name) < 0);
			}).sort(sortOptionName).forEach((name: string) => {
				addOption(name);
			});
		};

		var addNote = (note: string[]) => {
			if (note && note.length > 0) {
				note.forEach((note: string) => {
					commands.row.label.out.indent().accent(' : ').line(String(note));
				});
			}
		};

		var addExamples = (list: string[][]) => {
			if (list && list.length > 0) {
				builder.closeAll();
				lines.next();
				lines.row.label.out.line();
				lines.close();

				list.forEach((cols: string[]) => {
					if (cols.length === 1) {
						lines.next();
						lines.row.label.out.indent().line(String(cols[0]));
					}
					else if (cols.length > 1) {
						examples.next();
						examples.row.command.out.indent(2).accent(' $ ').line(String(cols[0]));
						examples.row.label.out.accent(' : ').line(String(cols[1]));
					}
				});
				examples.close();

				lines.next();
				lines.row.label.out.line();
			}
		};

		optKeys.forEach((name: string) => {
			var option: Option = this.expose.options.get(name);
			if (option.command) {
				// addOption(option);
				commandOptNames.push(option.name);
			}
		});

		optKeys.forEach((name: string) => {
			var option: Option = this.expose.options.get(name);
			if (option.global && !option.command) {
				// addOption(option);
				globalOptNames.push(option.name);
			}
		});

		if (allGroups.length > 0) {
			collection.valuesOf(this.expose.groups).sort(sorter.sortGroup).forEach((group: Group) => {

				var contents = collection.valuesOf(this.expose.commands).filter((cmd: Command) => {
					return cmd.groups.indexOf(group.name) > -1;
				});
				if (contents.length > 0) {
					addHeader(group.label);
					contents.sort(group.sorter).forEach((cmd: Command) => {
						addCommand(cmd, group);

						var i = allCommands.indexOf(cmd.name);
						if (i > -1) {
							allCommands.splice(i, 1);
						}
					});

					if (group.options.length > 0) {
						// addDivider();

						group.options.filter((name: string) => {
							return (commandOptNames.indexOf(name) < 0) && (globalOptNames.indexOf(name) < 0);
						}).sort(sortOptionName).forEach((name: string) => {
							addOption(name);
						});
					}
				}
				// eachProp(expose.commands.keys().sort(), (name) => {});
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
				commandOptNames.forEach((name: string) => {
					addOption(name);
				});
			}

			if (globalOptNames.length > 0) {
				globalOptNames.forEach((name: string) => {
					addOption(name);
				});
			}
		}
		builder.flush();
	}
}

export = Formatter;
