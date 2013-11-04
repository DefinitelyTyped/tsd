/// <reference path="../ObjectUtil.ts" />
/// <reference path="../assertVar.ts" />
/// <reference path="styler.ts" />
/// <reference path="writer.ts" />

module xm {

	var util = require('util');
	var jsesc = require('jsesc');

	export module encode {

		export var stringExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
		export var stringEsc = {
			quotes: 'double'
		};
		export var stringEscWrap = {
			json: true,
			quotes: 'double',
			wrap: true
		};
		export var stringQuote = '"';

		export var identExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
		export var identAnyExp = /^[a-z0-9](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
		export var identEscWrap = {
			quotes: 'double',
			wrap: true
		};
		export var intExp = /^\d+$/;

		export function wrapIfComplex(input:string):string {
			if (!identAnyExp.test(String(input))) {
				return jsesc(input, stringEscWrap);
			}
			return input;
		}

		export var escapeRep = '\\$&';
		export var escapeAdd = '\\$&$&';

		export function getReplacerFunc(chars:string[], values:string[], addSelf:boolean = false) {
			return function (match) {
				var i = chars.indexOf(match);
				if (i > -1 && i < values.length) {
					return values[i] + (addSelf ? match : '');
				}
				return match;
			};
		}
		function splitFix(chars:string):string[] {
			return chars.split('').map((char:string) => {
				return '\\' + char;
			});
		}

		//TODO is there no better way then this?
		export var nonPrintExp = /[\b\f\n\r\t\v\0\\]/g;
		export var nonPrintChr = '\b\f\n\r\t\v\0\\'.split('');
		export var nonPrintVal = splitFix('bfnrtv0\\');
		export var nonPrintRep = getReplacerFunc(nonPrintChr, nonPrintVal);

		export var nonPrintNotNLExp = /[\b\f\t\v\0\\]/g;
		export var nonPrintNotNLChr = '\b\f\t\v\\'.split('');
		export var nonPrintNotNLVal = splitFix('bftv0\\');
		export var nonPrintNotNLRep = getReplacerFunc(nonPrintNotNLChr, nonPrintNotNLVal);

		export var nonPrintNLExp = /(?:\r\n)|\n|\r/g;
		export var nonPrintNLChr = ['\r\n', '\n', '\r'];
		export var nonPrintNLVal = ['\\r\\n', '\\n', '\\r'];
		export var nonPrintNLRep = getReplacerFunc(nonPrintNLChr, nonPrintNLVal);

		export function stringDebug(input:string, newline:boolean = false):string {
			if (newline) {
				return input.replace(nonPrintNotNLExp, nonPrintNotNLRep).replace(nonPrintNLExp, getReplacerFunc(nonPrintNLChr, nonPrintNLVal, true));
			}
			return input.replace(nonPrintExp, nonPrintRep);
		}
	}

	/*
	 StyledOut: composite log text writer with semantic chainable api and swappable components (unfunkable)

	 wraps any xm.styler.Styler and xm.writer.TextWriter
	 */
	//TODO implement sub printer flow controls (indents, buffers, tables etc)
	//TODO leverage (yet unimplemented) LineWriter indent-level and word wrap
	//TODO implement diff (string / object) (extract and re-implement format from mocha-unfunk-reporter)
	//TODO implement feature to remember if last input closed a line (or otherwise auto close it)
	//TODO implement abstract line-start/line-end/clear to auto-insert line-breaks, link to indent/layout etc
	//TODO implement tree/stack-style with push/pop/flush/pointer states?
	export class StyledOut {

		private _styler:xm.styler.Styler;
		private _writer:xm.writer.TextWriter;

		nibs = {
			arrow: '-> ',
			double: '>> ',
			bullet: ' - ',
			edge: ' | ',
			none: '   '
		};

		constructor(writer:xm.writer.TextWriter = null, styler:xm.styler.Styler = null) {
			this._writer = (writer || new xm.writer.ConsoleLineWriter());
			this._styler = (styler || new xm.styler.ANSIStyler());

			this._writer.start();

			xm.ObjectUtil.hidePrefixed(this);
		}

		// - - - - - core (inline) - - - - -

		write(str:any):StyledOut {
			this._writer.write(this._styler.plain(str));
			return this;
		}

		// - - - - - core (line end) - - - - -

		line(str:any = ''):StyledOut {
			this._writer.writeln(this._styler.plain(str));
			return this;
		}

		//short sugar
		ln():StyledOut {
			this._writer.writeln(this._styler.zero());
			return this;
		}

		// - - - - - semantic wrappers - - - - -

		span(str:any):StyledOut {
			this._writer.write(this._styler.plain(str));
			return this;
		}

		block(str:any):StyledOut {
			this._writer.writeln(this._styler.plain(str));
			return this;
		}

		clear():StyledOut {
			this._writer.writeln(this._styler.zero());
			this._writer.writeln(this._styler.zero());
			return this;
		}

		ruler():StyledOut {
			this._writer.writeln('--------');
			return this;
		}

		ruler2():StyledOut {
			this._writer.writeln('----');
			return this;
		}

		h1(str:any):StyledOut {
			this._writer.writeln(this._styler.accent(str));
			this.ruler();
			this._writer.writeln();
			return this;
		}

		h2(str:any):StyledOut {
			this._writer.writeln(this._styler.accent(str));
			this.ruler();
			return this;
		}

		// - - - - - decoration styling (inline) - - - - -

		plain(str:any):StyledOut {
			this._writer.writeln(this._styler.plain(str));
			return this;
		}

		accent(str:any):StyledOut {
			this._writer.write(this._styler.accent(str));
			return this;
		}

		// - - - - - layout (inline) - - - - -

		space():StyledOut {
			this._writer.write(this._styler.plain(' '));
			return this;
		}

		// - - - - - status styling (inline) - - - - -

		success(str:any):StyledOut {
			this._writer.write(this._styler.success(str));
			return this;
		}

		warning(str:any):StyledOut {
			this._writer.write(this._styler.warning(str));
			return this;
		}

		error(str:any):StyledOut {
			this._writer.write(this._styler.error(str));
			return this;
		}

		// - - - - - status finalisation (line end) - - - - -

		//like success() but with emphasis and newline
		ok(str:any):StyledOut {
			this._writer.writeln(this._styler.ok(str));
			return this;
		}

		//like warning() but with emphasis and newline
		warn(str:any):StyledOut {
			this._writer.writeln(this._styler.warn(str));
			return this;
		}

		//like error() but with emphasis and newline
		fail(str:any):StyledOut {
			this._writer.writeln(this._styler.fail(str));
			return this;
		}

		// - - - - - handy utils - - - - -

		cond(condition:boolean, str:any, alt?:any):StyledOut {
			if (condition) {
				this._writer.write(this._styler.plain(str));
			}
			else if (arguments.length > 2) {
				this._writer.write(this._styler.plain(alt));
			}
			return this;
		}

		inspect(value:any, depth:number = 4, showHidden:boolean = false):StyledOut {
			this._writer.writeln(this._styler.plain(util.inspect(value, <any>{showHidden: showHidden, depth: depth})));
			return this;
		}

		//TODO add test?
		stringWrap(str:string):StyledOut {
			this._writer.write(this._styler.plain(xm.encode.wrapIfComplex(str)));
			return this;
		}

		// - - - - - extra api - - - - -

		//TODO add test/
		label(label:string):StyledOut {
			this._writer.write(this._styler.plain(xm.encode.wrapIfComplex(label) + ': '));
			return this;
		}

		//TODO add test?
		indent():StyledOut {
			this._writer.write(this.nibs.none);
			return this;
		}

		//TODO add test?
		bullet():StyledOut {
			this._writer.write(this._styler.accent(this.nibs.bullet));
			return this;
		}

		//TODO add test?
		index(num:any):StyledOut {
			this._writer.write(this._styler.plain(String(num) + +': '));
			return this;
		}

		//TODO add test?
		info(accent:boolean = false):StyledOut {
			if (accent) {
				this._writer.write(this._styler.accent(this.nibs.arrow));
			}
			else {
				this._writer.write(this._styler.plain(this.nibs.arrow));
			}
			return this;
		}

		//TODO add test?
		report(accent:boolean = false):StyledOut {
			if (accent) {
				this._writer.write(this._styler.accent(this.nibs.double));
			}
			else {
				this._writer.write(this._styler.plain(this.nibs.double));
			}
			return this;
		}

		// - - - - - extra api - - - - -

		//activate super-plain mode
		unfunk():StyledOut {
			this.useStyler(new xm.styler.NoStyler());
			return this;
		}

		//flush writer
		//TODO drop finalise() cargo-cult artifact? (could be usefull although migt as well go through .writer reference)
		finalise():void {
			this._writer.finalise();
			//this._writer.start();
		}

		useWriter(writer:xm.writer.TextWriter):xm.StyledOut {
			//beh, no interface check
			xm.assertVar(writer, 'object', 'writer');
			this._writer.finalise();
			this._writer = writer;
			this._writer.start();
			return this;
		}

		useStyler(styler:xm.styler.Styler):xm.StyledOut {
			//beh, no interface check
			xm.assertVar(styler, 'object', 'styler');
			this._styler = styler;
			return this;
		}

		get writer():xm.writer.TextWriter {
			return this._writer;
		}

		get styler():xm.styler.Styler {
			return this._styler;
		}
	}
}
