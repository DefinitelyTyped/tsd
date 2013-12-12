/// <reference path="../_ref.ts" />
/// <reference path="../../xm/RegExpGlue.ts" />
/// <reference path="../../xm/LineParser.ts" />
/// <reference path="../../xm/data/AuthorInfo.ts" />
/// <reference path="DefInfo.ts" />

module tsd {
	'use strict';

	//TODO replace vanilla RegExp with XRegExp? (low prio)

	var endSlashTrim = /\/?$/;

	var glue = xm.RegExpGlue.get;

	//define some reusble RegExps
	var expStart = /^/;
	var expEnd = /$/;
	var spaceReq = /[ \t]+/;
	var spaceOpt = /[ \t]*/;

	var anyGreedy = /.*/;
	var anyLazy = /.*?/;

	var anyGreedyCap = /(.*)/;
	var anyLazyCap = /(.*?)/;

	var identifierCap = /([\w\._-]*(?:[ \t]*[\w\._-]+)*?)/;
	var versionCap = /-?v?(\d+\.\d+\.?\d*\.?\d*)?/;
	var wordsCap = /([\w \t_-]+[\w]+)/;
	var labelCap = /([\w_-]+[\w]+)/;

	var delimStart = /[<\[\{\(]/;
	var delimStartOpt = /[<\[\{\(]?/;
	var delimEnd = /[\)\}\]>]/;
	var delimEndOpt = /[\)\}\]>]?/;

	var seperatorOpt = /[,;]?/;


	//http://blog.mattheworiordan.com/post/13174566389/url-regular-expression-for-links-with-or-without-the
	var urlGroupsCap = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/;
	var urlFullCap = /((?:(?:[A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)(?:(?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/;

	//var referencePath = /^[ \t]*\/\/\/\/?[ \t]*<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>[ \t]*$/gm;
	var referenceTag = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/;

	//glue long RegExp's from parts
	var commentStart = glue(expStart, spaceOpt, /\/\/+/, spaceOpt).join();
	var optUrl = glue('(?:', spaceOpt, delimStartOpt, urlFullCap, delimEndOpt, ')?').join();

	var commentLine = glue(commentStart)
	.append(anyLazyCap)
	.append(spaceOpt, expEnd)
	.join();

	var referencePath = glue(expStart, spaceOpt, /\/\/+/, spaceOpt)
	.append(referenceTag)
	.append(spaceOpt, expEnd)
	.join();

	var typeHead = glue(commentStart)
	.append(/Type definitions?/, spaceOpt, /(?:for)?:?/, spaceOpt, identifierCap)
	.append(/[ \t:-]+/, versionCap, spaceOpt)
	.append(anyGreedy, expEnd)
	.join('i');

	var projectUrl = glue(commentStart)
	.append(/Project/, spaceOpt, /:?/, spaceOpt)
	.append(delimStartOpt, urlFullCap, delimEndOpt)
	.append(spaceOpt, expEnd)
	.join('i');


	var defAuthorUrl = glue(commentStart)
	.append(/Definitions[ \t]+by[ \t]*:?/, spaceOpt)
	.append(wordsCap, optUrl)
	.append(spaceOpt, seperatorOpt, spaceOpt, expEnd)
	.join('i');

	var defAuthorUrlAlt = glue(commentStart)
	.append(/Author[ \t]*:?/, spaceOpt)
	.append(wordsCap, optUrl)
	.append(spaceOpt, seperatorOpt, spaceOpt, expEnd)
	.join('i');

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

		//TODO evolve a better solution to the way line parsers are chained
		parse(data:tsd.DefInfo, source:string):void {
			//xm.log('parse: ', data.combi());

			data.resetFields();

			//setup parser
			this.parser = new xm.LineParserCore(this.verbose);

			var fields = ['projectUrl', 'defAuthorUrl', 'defAuthorUrlAlt', 'reposUrl', 'reposUrlAlt', 'referencePath'];

			this.parser.addParser(new xm.LineParser('any', anyGreedyCap, 0, null, ['head', 'any']));

			this.parser.addParser(new xm.LineParser('head', typeHead, 2, (match:xm.LineParserMatch) => {
				data.name = match.getGroup(0, data.name);
				data.version = match.getGroup(1, data.version);
				//data.submodule = match.getGroup(2, data.submodule);
			}, fields));

			fields = mutate(fields, null, ['projectUrl']);

			this.parser.addParser(new xm.LineParser('projectUrl', projectUrl, 1, (match:xm.LineParserMatch) => {
				data.projectUrl = match.getGroup(0, data.projectUrl).replace(endSlashTrim, '');
			}, fields));


			fields = mutate(fields, ['defAuthorAppend'], ['defAuthorUrl', 'defAuthorUrlAlt']);

			this.parser.addParser(new xm.LineParser('defAuthorUrl', defAuthorUrl, 2, (match:xm.LineParserMatch) => {
				data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));
			}, fields));

			this.parser.addParser(new xm.LineParser('defAuthorUrlAlt', defAuthorUrlAlt, 2, (match:xm.LineParserMatch) => {
				data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));
			}, fields));

			this.parser.addParser(new xm.LineParser('defAuthorAppend', wordsUrl, 2, (match:xm.LineParserMatch) => {
				data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));
			}, fields));

			fields = mutate(fields, null, ['defAuthorAppend']);
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

			//xm.log(this.parser.getInfo());

			if (this.verbose) {
				xm.log(this.parser.getInfo());
			}

			this.parser.parse(source, ['head']);
		}
	}
}
