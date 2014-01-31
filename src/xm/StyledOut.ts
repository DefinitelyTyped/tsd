/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="../../typings/miniwrite/miniwrite.d.ts" />
/// <reference path="../../typings/ministyle/ministyle.d.ts" />
/// <reference path="object.ts" />
/// <reference path="assertVar.ts" />
/// <reference path="encode.ts" />

module xm {
	'use strict';

	var util = require('util');

	var miniwrite = <typeof MiniWrite> require('miniwrite');
	var ministyle = <typeof MiniStyle> require('ministyle');

	/*
	 StyledOut: composite text writer with semantic chainable api and swappable components (unfunkable)

	 */
	// TODO implement sub printer flow controls (indents, buffers, tables etc)
	// TODO leverage (yet unimplemented) LineWriter indent-level and word wrap
	// TODO implement diff (string / object) (extract and re-implement format from mocha-unfunk-reporter)
	// TODO implement feature to remember if last input closed a line (or otherwise auto close it)
	// TODO implement abstract line-start/line-end/clear to auto-insert line-breaks, link to indent/layout etc
	// TODO implement tree/stack-style with push/pop/flush/pointer states?
	// TODO revise API for common usage scenarios
	// -final reporting (succes/fail/pending/total + pluralise etc)
	// -various statuses (expected etc)
	// TODO split further into semantics and structure
	// TODO consider dynamicify indent size?
	export class StyledOut {

		private _style:MiniStyle.Style;
		private _line:MiniWrite.Chars;
		private _tabSize:number = 3;

		nibs = {
			arrow: '-> ',
			double: '>> ',
			single: ' > ',
			bullet: ' - ',
			edge: ' | ',
			ruler: '---',
			shell: ' $ ',
			dash: '-- ',
			decl: ' : ',
			none: '   '
		};

		constructor(write?:MiniWrite.Line, style?:MiniStyle.Style) {
			if (style) {
				ministyle.assertMiniStyle(style);
			}
			if (write) {
				miniwrite.assertMiniWrite(write);
			}
			this._style = (style || ministyle.ansi());
			this._line = miniwrite.chars((write || miniwrite.log()));
			xm.object.hidePrefixed(this);
		}

		// - - - - - core (inline) - - - - -

		write(str:any):StyledOut {
			this._line.write(str);
			return this;
		}

		// - - - - - core (line end) - - - - -

		line(str?:any):StyledOut {
			if (arguments.length < 1 || typeof str === 'undefined') {
				this._line.writeln('');
			}
			else {
				this._line.writeln(this._style.plain(str));
			}
			return this;
		}

		// short sugar
		ln():StyledOut {
			this._line.writeln('');
			return this;
		}

		// - - - - - semantic wrappers - - - - -

		span(str:any):StyledOut {
			this._line.write(this._style.plain(str));
			return this;
		}

		block(str:any):StyledOut {
			this._line.writeln(this._style.plain(str));
			return this;
		}

		clear():StyledOut {
			this._line.writeln('');
			this._line.writeln('');
			return this;
		}

		ruler(levels:number = 1):StyledOut {
			var str = '';
			for (var i = 0; i < levels; i++) {
				str += this.nibs.ruler;
			}
			this._line.writeln(str);
			return this;
		}

		heading(str:any, level:number = 1):StyledOut {
			this._line.writeln(this._style.accent(str));
			var l = Math.max(0, 3 - level);
			if (l > 0) {
				this.ruler(l);
			}
			return this;
		}

		// - - - - - decoration styling (inline) - - - - -

		plain(str:any):StyledOut {
			this._line.writeln(this._style.plain(str));
			return this;
		}

		accent(str:any):StyledOut {
			this._line.write(this._style.accent(str));
			return this;
		}

		muted(str:any):StyledOut {
			this._line.write(this._style.muted(str));
			return this;
		}

		// - - - - - layout (inline) - - - - -

		// entering the sanity/insanity twilight zone (lets push it, see what happens)
		space():StyledOut {
			this._line.write(this._style.plain(' '));
			return this;
		}

		sp():StyledOut {
			this._line.write(this._style.plain(' '));
			return this;
		}

		// - - - - - status styling (inline) - - - - -

		success(str:any):StyledOut {
			this._line.write(this._style.success(str));
			return this;
		}

		warning(str:any):StyledOut {
			this._line.write(this._style.warning(str));
			return this;
		}

		error(str:any):StyledOut {
			this._line.write(this._style.error(str));
			return this;
		}

		// - - - - - handy utils - - - - -

		cond(condition:boolean, str:any, alt?:any):StyledOut {
			if (condition) {
				this._line.write(this._style.plain(str));
			}
			else if (arguments.length > 2) {
				this._line.write(this._style.plain(alt));
			}
			return this;
		}

		alt(str:any, alt:any):StyledOut {
			if (xm.isValid(str) && !/^\s$/.test(str)) {
				this._line.write(this._style.plain(str));
			}
			else if (arguments.length > 1) {
				this._line.write(this._style.plain(alt));
			}
			return this;
		}

		// TODO should not be writeln(
		inspect(value:any, depth:number = 4, showHidden:boolean = false):StyledOut {
			this._line.writeln(this._style.plain(util.inspect(value, <any>{showHidden: showHidden, depth: depth})));
			return this;
		}

		// TODO add test?
		stringWrap(str:string):StyledOut {
			this._line.write(this._style.plain(xm.wrapIfComplex(str)));
			return this;
		}

		// - - - - -chaining helpers - - - - -

		glue(out:StyledOut):StyledOut {
			return this;
		}

		swap(out:StyledOut):StyledOut {
			return out;
		}

		// - - - - - extra api - - - - -

		label(label:string):StyledOut {
			this._line.write(this._style.plain(xm.wrapIfComplex(label) + ': '));
			return this;
		}

		indent(levels:number = 1):StyledOut {
			if (levels > 0) {
				var str = '';
				for (var i = 0; i < levels; i++) {
					str += this.nibs.none;
				}
				this._line.write(str);
			}
			return this;
		}

		bullet(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.bullet));
			}
			else {
				this._line.write(this._style.plain(this.nibs.bullet));
			}
			return this;
		}

		index(num:any):StyledOut {
			this._line.write(this._style.plain(String(num) + ': '));
			return this;
		}

		info(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.arrow));
			}
			else {
				this._line.write(this._style.plain(this.nibs.arrow));
			}
			return this;
		}

		report(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.double));
			}
			else {
				this._line.write(this._style.plain(this.nibs.double));
			}
			return this;
		}

		note(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.single));
			}
			else {
				this._line.write(this._style.plain(this.nibs.single));
			}
			return this;
		}

		shell(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.shell));
			}
			else {
				this._line.write(this._style.plain(this.nibs.shell));
			}
			return this;
		}

		// TODO add test?
		dash(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.dash));
			}
			else {
				this._line.write(this._style.plain(this.nibs.dash));
			}
			return this;
		}

		// TODO add test?
		edge(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.edge));
			}
			else {
				this._line.write(this._style.plain(this.nibs.edge));
			}
			return this;
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// TODO add test?
		tweakURI(str:string, trimHttp:boolean = false, wrapAngles:boolean = false):StyledOut {
			var repAccent = this._style.accent('/');
			// lame tricks
			if (wrapAngles) {
				this._line.write(this._style.muted('<'));
			}
			if (trimHttp) {
				this._line.write(str.replace(/^\w+?:\/\//, '').replace(/\//g, repAccent));
			}
			else {
				this._line.write(str.split(/:\/\//).map((str) => {
					return str.replace(/\//g, repAccent);
				}).join(this._style.accent('://')));
			}
			if (wrapAngles) {
				this._line.write(this._style.muted('>'));
			}
			return this;
		}

		// TODO add test?
		tweakPath(str:string, muted:boolean = false):StyledOut {
			return this.tweakExp(str, /\//g, muted);
		}

		// TODO add test?
		tweakPunc(str:string, muted:boolean = false):StyledOut {
			return this.tweakExp(str, /[\/\.,_-]/g, muted);
		}

		// TODO add test?
		tweakBraces(str:string, muted:boolean = false):StyledOut {
			return this.tweakExp(str, /[\[\{\(\<>\)\}\]]/g, muted);
		}

		// TODO add test?
		tweakExp(str:string, expr:RegExp, muted:boolean = false):StyledOut {
			if (muted) {
				this._line.write(str.replace(expr, (value) => {
					return this._style.muted(value);
				}));
				return this;
			}
			this._line.write(str.replace(expr, (value) => {
				return this._style.accent(value);
			}));
			return this;
		}

		// - - - - - extra api - - - - -

		// activate super-plain mode
		unfunk():StyledOut {
			this._line.flush();
			this._style = ministyle.plain();
			return this;
		}

		// flush writer
		// TODO drop finalise() cargo-cult artifact? (could be usefull although migt as well go through .writer reference)
		finalise():void {
			this._line.flush();
		}

		useStyle(mini:MiniStyle.Style):xm.StyledOut {
			ministyle.assertMiniStyle(mini);
			this._style = mini;
			return this;
		}

		useWrite(mini:MiniWrite.Line):xm.StyledOut {
			miniwrite.assertMiniWrite(mini);
			this._line.useTarget(mini);
			return this;
		}

		getWrite():MiniWrite.Chars {
			return this._line;
		}

		getStyle():MiniStyle.Style {
			return this._style;
		}
	}
}
