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

module xm {
	'use strict';

	var util = require('util');
	var trimmedLine = /([ \t]*)(.*?)([ \t]*)(\r\n|\n|\r|$)/g;

	/*
	 LineParserCore: parse lines based text using RegExps
	 */
	export class LineParserCore {

		parsers = new xm.KeyValueMap();

		constructor(public verbose?:bool = false) {

		}

		addParser(parser:LineParser) {
			this.parsers.set(parser.id, parser);
		}

		getInfo() {
			var ret:any = {};
			ret.parsers = this.parsers.keys().sort();
			return ret;
		}

		getParser(id:string):LineParser {
			return this.parsers.get(id, null);
		}

		private link() {
			xm.eachElem(this.parsers.values(), (parser:LineParser) => {
				xm.eachElem(parser.nextIds, (id:string) => {
					var p = this.parsers.get(id);
					if (p) {
						parser.next.push(p);
					}
					else {
						console.log('cannot find parser: ' + id);
					}
				});
			});
		}

		get(ids:string[]):LineParser[] {
			return reduceArray(ids, [], (memo:LineParser[], id:string) => {
				if (!this.parsers.has(id)) {
					console.log('missing parser ' + id);
					return memo;
				}
				memo.push(this.parsers.get(id));
				return memo;
			});
		}

		all():LineParser[] {
			return this.parsers.values();
		}

		listIds(parsers:LineParser[]):string[] {
			return reduceArray(parsers, [], (memo:string[], parser:LineParser) => {
				memo.push(parser.id);
				return memo;
			});
		}

		parse(source:string, asType?:string[]) {

			var log = this.verbose ? (...rest:any[]) => {
				console.log.apply(console, rest);
			} : (...rest:any[]) => {
				//ignore
			};

			log('source.length: ' + source.length);
			log('asType: ' + asType);
			//link all
			this.link();

			var res:LineParserMatch[] = [];
			var possibles:LineParser[] = asType ? this.get(asType) : this.all();

			var length = source.length;
			var line;
			var i, ii;
			var offset = 0;
			var cursor = 0;
			var lineCount = 0;
			var procLineCount = 0;

			var safetyBreak = 20;

			trimmedLine.lastIndex = 0;
			while (line = trimmedLine.exec(source)) {
				log('-----------------------------------------------------------------------------------------');

				if (line[0].length === 0) {
					console.log('zero length line match?');
					break;
				}
				if (line.index + line[0].lengt === cursor) {
					console.log('cursor not advancing?');
					break;
				}


				//pre-advance cursor
				cursor = line.index + line[0].length;
				trimmedLine.lastIndex = cursor;

				lineCount++;
				log('line: ' + lineCount);
				/*
				 console.log('line:');
				 console.log(line);
				 console.log('cursor: ' + cursor);
				 */

				//break some development loops :)
				if (lineCount > safetyBreak) {
					//report this better?
					console.log('\n\n\n\nsafetyBreak bail at ' + lineCount + '> ' + safetyBreak + '!\n\n\n\n\n');
					throw('parser safetyBreak bail!');
				}

				if (line.length < 5) {
					log('skip bad line match');
				}
				else if (typeof line[2] === 'undefined' || line[2] === '') {
					log('skip empty line');
				}
				else {
					procLineCount++;

					var text = line[2];
					log('[[' + text + ']]');
					log('---');

					var choice:LineParserMatch[] = [];

					for (i = 0, ii = possibles.length; i < ii; i++) {
						var parser = possibles[i];
						var match = parser.match(text, offset, cursor);
						if (match) {
							log(parser.getName() + ' -> match!');
							log(match.match);
							choice.push(match);
							//we could break after first?
							break;
						}
						else {
							log(parser.getName());
						}
					}

					log('---');

					log('choices ' + choice.length);

					if (choice.length === 0) {
						log('cannot match line');
						break;
					}
					else if (choice.length === 1) {
						log('single match line');
						log('using ' + choice[0].parser.id);
						//console.log(choice[0].match);

						res.push(choice[0]);
						possibles = choice[0].parser.next;
						log('switching possibles: [' + this.listIds(possibles) + ']');
					}
					else {
						log('multi match line');
						log('using ' + choice[0].parser.id);
						//console.log(choice[0].match);
						//TODO pick one!

						//why not first?
						res.push(choice[0]);
						possibles = choice[0].parser.next;
						log('switching possibles: [' + this.listIds(possibles) + ']');
					}
				}
				//keep looping?
				if (possibles.length === 0) {
					log('no more possibles, break');
					break;
				}
				if (cursor >= length) {
					//done
					log('done ' + cursor + ' >= ' + length + ' lineCount: ' + lineCount);
					break;
				}
			}
			log('--------------');

			log('total lineCount: ' + lineCount);
			log('procLineCount: ' + procLineCount);
			//console.log(util.inspect(res, false, 10));
			log('res.length: ' + res.length);
			log(' ');

			if (res.length > 0) {
				xm.eachElem(res, (match:LineParserMatch) => {
					match.extract();
				});
			}
		}
	}
	/*
	 LineParser: reusable parser in a LineParserCore
	 */
	export class LineParser {

		next:LineParser[] = [];

		//params: id, name of a matcher, callback to apply mater's data, optional list of following parsers
		constructor(public id:string, public exp:RegExp, public groupsMin:number, public callback:(match:LineParserMatch) => void, public nextIds:string[] = []) {
		}

		match(str:string, offset:number, limit:number):LineParserMatch {
			this.exp.lastIndex = offset;
			var match = this.exp.exec(str);
			if (!match || match.length < 1) {
				return null;
			}
			//move this to constructor?
			if (this.groupsMin >= 0 && match.length < this.groupsMin) {
				throw(new Error(this.getName() + 'bad match expected ' + this.groupsMin + ' groups, got ' + (this.match.length - 1)));
			}
			return new LineParserMatch(this, match);
		}

		getName():string {
			return this.id;
		}
	}
	/*
	 LineParserMatch: single match from LineParser
	 */
	export class LineParserMatch {

		constructor(public parser:LineParser, public match) {
		}

		extract():void {
			//hoop hoop!
			if (this.parser.callback) {
				this.parser.callback(this);
			}
		}

		getGroup(num:number, alt?:string = ''):string {
			//validate for sanity
			if (num >= this.match.length - 1) {
				throw(new Error(this.parser.getName() + ' group index ' + num + ' > ' + (this.match.length - 2)));
			}
			/*if (this.parser.groupsMin >= 0 && num >= this.parser.groupsMin) {
			 throw(new Error(this.getName() + ' group index ' + num + ' >= parser.groupsMin ' + (this.parser.groupsMin)));
			 }*/
			num += 1;
			if (num < 1 || num > this.match.length) {
				return alt;
			}
			if (typeof this.match[num] === 'undefined') {
				return alt;
			}
			return this.match[num];
		}

		getGroupFloat(num:number, alt?:number = 0):number {
			var value = parseFloat(this.getGroup(num));
			if (isNaN(value)) {
				return alt;
			}
			return value;
		}

		getName():string {
			return this.parser.getName();
		}
	}
}

