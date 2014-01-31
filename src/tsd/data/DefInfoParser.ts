/// <reference path="../_ref.ts" />
/// <reference path="../../xm/RegExpGlue.ts" />
/// <reference path="../../xm/LineParser.ts" />
/// <reference path="../../xm/data/AuthorInfo.ts" />
/// <reference path="DefInfo.ts" />

module tsd {
	'use strict';

	/* tslint:disable:max-line-length */

	// TODO replace vanilla RegExp with XRegExp? (low prio)

	var endSlashTrim = /\/?$/;

	var glue = xm.RegExpGlue.get;

	// define some reusble RegExps
	var expStart = /^/;
	var expEnd = /$/;
	var spaceReq = /[ \t]+/;
	var spaceOpt = /[ \t]*/;

	var anyGreedy = /.*/;
	var anyLazy = /.*?/;

	var anyGreedyCap = /(.*)/;
	var anyLazyCap = /(.*?)/;

	var identifierCap = /(\w+(?:[ \w\.-]*?\w)*?)/;
	var versionCap = /(?:[ \t:-]?v?(\d+\.\d+\.?\d*\.?\d*))?/;
	var semwerCap = /[ \(-]+v?(\d+(?:\.\d+)*(?:-[\w-]+(?:\.[\w-]+)?)?)\)?/;
	var wordsCap = /([\w \t-]+[\w]+)/;
	var labelCap = /([\w-]+[\w]+)/;

	var delimStart = /[<\[\{\(]/;
	var delimStartOpt = /[<\[\{\(]?/;
	var delimEnd = /[\)\}\]>]/;
	var delimEndOpt = /[\)\}\]>]?/;

	var seperatorOpt = /[,;]?/;

	var uft8bom = /\uFEFF/;
	var uft8bomOpt = /\uFEFF?/;

	// http://blog.mattheworiordan.com/post/13174566389/url-regular-expression-for-links-with-or-without-the
	var urlGroupsCap = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/;
	var urlFullCap = /((?:(?:[A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)(?:(?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/;

	// http://stackoverflow.com/a/12963134/1026362
	var charsIntl = /[0-9A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02af\u1d00-\u1d25\u1d62-\u1d65\u1d6b-\u1d77\u1d79-\u1d9a\u1e00-\u1eff\u2090-\u2094\u2184-\u2184\u2488-\u2490\u271d-\u271d\u2c60-\u2c7c\u2c7e-\u2c7f\ua722-\ua76f\ua771-\ua787\ua78b-\ua78c\ua7fb-\ua7ff\ufb00-\ufb06]+/;

	// var referencePath = /^[ \t]*\/\/\/\/?[ \t]*<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>[ \t]*$/gm;
	var referenceTag = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/;

	// glue long RegExp's from parts
	var commentStart = glue(expStart, spaceOpt, /\/\/+/, spaceOpt).join();
	var commentStartFirst = glue(expStart, uft8bomOpt, spaceOpt, /\/\/+/, spaceOpt).join();
	var optUrl = glue('(?:', spaceOpt, delimStartOpt, urlFullCap, delimEndOpt, ')?').join();

	var wordsIntlCap = glue('(', charsIntl, '(?:', /[ _-]+/, charsIntl, ')*', ')').join();

	// defeat.. just use anything
	var wordy = /[^ \t\<\(\{\{,;:]+/;
	var nameHackyCap = glue('(', wordy, '(?:', / /, wordy, ')*', ')').join();

	var commentLine = glue(commentStartFirst)
		.append(anyLazyCap)
		.append(spaceOpt, expEnd)
		.join();

	var referencePath = glue(expStart, uft8bomOpt, spaceOpt, /\/\/+/, spaceOpt)
		.append(referenceTag)
		.append(spaceOpt, expEnd)
		.join();

	var typeHead = glue(commentStartFirst)
		.append(/Type definitions?/, spaceOpt, /(?:for)?:?/, spaceOpt, anyLazyCap, spaceOpt)
		// .append(/Type definitions?/, spaceOpt, /(?:for)?:?/, spaceOpt, identifierCap)
		// .append(versionCap, spaceOpt)
		.append(expEnd)
		.join('i');

	var projectUrl = glue(commentStart)
		.append(/Project/, spaceOpt, /:?/, spaceOpt)
		.append(delimStartOpt, urlFullCap, delimEndOpt)
		.append(spaceOpt, expEnd)
		.join('i');

	var defAuthorUrl = glue(commentStart)
		.append(/Definitions[ \t]+by[ \t]*:?/, spaceOpt)
		.append(nameHackyCap, optUrl)
		.append(spaceOpt, anyLazyCap, spaceOpt, expEnd)
		.join('i');

	var defAuthorFollow = glue(commentStart)
		.append(/[ \t]*/, spaceOpt)
		.append(nameHackyCap, optUrl)
		.append(spaceOpt, anyLazyCap, spaceOpt, expEnd)
		.join('i');

	var defAuthorUrlRest = glue(spaceOpt)
		.append(/(?:,|(?:and))/, spaceOpt)
		.append(nameHackyCap, optUrl)
		.append(spaceOpt)
		.join('gi');

	var reposUrl = glue(commentStart)
		.append(/Definitions/, spaceOpt, /:?/, spaceOpt)
		.append(delimStartOpt, urlFullCap, delimEndOpt)
		.append(spaceOpt, expEnd)
		.join('i');

	var reposUrlAlt = glue(commentStart)
		.append(/DefinitelyTyped/, spaceOpt, /:?/, spaceOpt)
		.append(delimStartOpt, urlFullCap, delimEndOpt)
		.append(spaceOpt, expEnd)
		.join('i');

	var labelUrl = glue(commentStart)
		.append(labelCap, spaceOpt, /:?/, spaceOpt)
		.append(delimStartOpt, urlFullCap, delimEndOpt)
		.append(spaceOpt, expEnd)
		.join('i');

	var labelWordsUrl = glue(commentStart)
		.append(labelCap, spaceOpt, /:?/, spaceOpt)
		.append(wordsCap, spaceOpt)
		.append(delimStartOpt, urlFullCap, delimEndOpt)
		.append(spaceOpt, expEnd)
		.join('i');

	var wordsUrl = glue(commentStart)
		.append(wordsCap, spaceOpt)
		.append(delimStartOpt, urlFullCap, delimEndOpt)
		.append(spaceOpt, expEnd)
		.join('i');

	// dry helper
	function mutate(base:string[], add:string[], remove:string[]):string[] {
		var res:string[] = (base ? base.slice(0) : (<string[]> []));
		var i:number , ii:number, index:number;
		if (add) {
			for (i = 0, ii = add.length; i < ii; i++) {
				res.push(add[i]);
			}
		}
		if (remove) {
			for (i = 0, ii = remove.length; i < ii; i++) {
				while ((index = res.indexOf(remove[i])) > -1) {
					res.splice(index, 1);
				}
			}
		}
		return res;
	}

	/*
	 DefInfoParser: parse definition source-code for info header
	 */
	export class DefInfoParser {

		parser:xm.LineParserCore;

		constructor(public verbose:boolean = false) {

		}

		// TODO evolve a better solution to the way line parsers are chained
		parse(data:tsd.DefInfo, source:string):void {
			// xm.log('parse: ', data.combi());

			data.resetFields();

			// setup parser
			this.parser = new xm.LineParserCore(this.verbose);

			var fields = ['projectUrl', 'defAuthorUrl', 'reposUrl', 'reposUrlAlt', 'referencePath'];

			this.parser.addParser(new xm.LineParser('any', anyGreedyCap, 0, null, ['head', 'any']));

			this.parser.addParser(new xm.LineParser('head', typeHead, 1, (match:xm.LineParserMatch) => {
				data.name = match.getGroup(0, data.name);

				semwerCap.lastIndex = 0;
				var sub = semwerCap.exec(data.name);
				if (sub) {
					data.version = sub[1];
				}
			}, fields));

			fields = mutate(fields, null, ['projectUrl']);

			this.parser.addParser(new xm.LineParser('projectUrl', projectUrl, 1, (match:xm.LineParserMatch) => {
				data.projectUrl = match.getGroup(0, data.projectUrl).replace(endSlashTrim, '');
			}, fields));

			fields = mutate(fields, ['defAuthorFollow'], null);

			var author = (match:xm.LineParserMatch) => {
				data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));

				var rest = match.getGroup(2);
				var sub;
				if (rest.length > 0) {
					defAuthorUrlRest.lastIndex = 0;
					while (sub = defAuthorUrlRest.exec(rest)) {
						defAuthorUrlRest.lastIndex = sub.index + sub[0].length + 1;
						if (sub.length > 1) {
							data.authors.push(new xm.AuthorInfo(sub[1], sub[2]));
						}
					}
				}
			};
			this.parser.addParser(new xm.LineParser('defAuthorUrl', defAuthorUrl, 3, author, fields));
			this.parser.addParser(new xm.LineParser('defAuthorFollow', defAuthorFollow, 3, author, fields));

			fields = mutate(fields, null, ['defAuthorUrl', 'defAuthorFollow']);

			fields = mutate(fields, null, ['reposUrl', 'reposUrlAlt']);

			this.parser.addParser(new xm.LineParser('reposUrl', reposUrl, 1, (match:xm.LineParserMatch) => {
				data.reposUrl = match.getGroup(0, data.reposUrl).replace(endSlashTrim, '');
			}, fields));

			this.parser.addParser(new xm.LineParser('reposUrlAlt', reposUrlAlt, 1, (match:xm.LineParserMatch) => {
				data.reposUrl = match.getGroup(0, data.reposUrl).replace(endSlashTrim, '');
			}, fields));

			this.parser.addParser(new xm.LineParser('referencePath', referencePath, 1, (match:xm.LineParserMatch) => {
				data.references.push(match.getGroup(0));
			}, ['referencePath']));

			this.parser.addParser(new xm.LineParser('comment', commentLine, 0, null, ['comment']));

			// xm.log(this.parser.getInfo());

			if (this.verbose) {
				xm.log(this.parser.getInfo());
			}

			this.parser.parse(source, ['head']);
		}
	}

	/* tslint:enable:max-line-length */
}
