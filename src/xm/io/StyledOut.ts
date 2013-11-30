/// <reference path="../../../typings/miniwrite/miniwrite.d.ts" />
/// <reference path="../../../typings/ministyle/ministyle.d.ts" />
/// <reference path="../ObjectUtil.ts" />
/// <reference path="../assertVar.ts" />
/// <reference path="../encode.ts" />

module xm {

	var util = require('util');

	var miniwrite = <typeof MiniWrite> require('miniwrite');
	var ministyle = <typeof MiniStyle> require('ministyle');

	/*
	 StyledOut: composite text writer with semantic chainable api and swappable components (unfunkable)

	 */
	//TODO implement sub printer flow controls (indents, buffers, tables etc)
	//TODO leverage (yet unimplemented) LineWriter indent-level and word wrap
	//TODO implement diff (string / object) (extract and re-implement format from mocha-unfunk-reporter)
	//TODO implement feature to remember if last input closed a line (or otherwise auto close it)
	//TODO implement abstract line-start/line-end/clear to auto-insert line-breaks, link to indent/layout etc
	//TODO implement tree/stack-style with push/pop/flush/pointer states?
	//TODO revise API for common usage scenarios
	// -final reporting (succes/fail/pending/total + pluralise etc)
	// -various statuses (expected etc)
	//TODO drop ok/fail/warn
	//TODO split further into semantics and structure
	//TODO consider dynamicify indent size?
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
			xm.ObjectUtil.hidePrefixed(this);
		}

		// - - - - - core (inline) - - - - -

		write(str:any):StyledOut {
			this._line.write(this._style.plain(str));
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

		//short sugar
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

		inspect(value:any, depth:number = 4, showHidden:boolean = false):StyledOut {
			this._line.writeln(this._style.plain(util.inspect(value, <any>{showHidden: showHidden, depth: depth})));
			return this;
		}

		//TODO add test?
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

		//TODO add test/
		label(label:string):StyledOut {
			this._line.write(this._style.plain(xm.wrapIfComplex(label) + ': '));
			return this;
		}

		//TODO add test?
		indent(levels:number = 1):StyledOut {
			var str = '';
			for (var i = 0; i < levels; i++) {
				str += this.nibs.none;
			}
			this._line.write(str);
			return this;
		}

		//TODO add test?
		bullet(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.bullet));
			}
			else {
				this._line.write(this._style.plain(this.nibs.bullet));
			}
			return this;
		}

		//TODO add test?
		index(num:any):StyledOut {
			this._line.write(this._style.plain(String(num) + ': '));
			return this;
		}

		//TODO add test?
		info(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.arrow));
			}
			else {
				this._line.write(this._style.plain(this.nibs.arrow));
			}
			return this;
		}

		//TODO add test?
		report(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.double));
			}
			else {
				this._line.write(this._style.plain(this.nibs.double));
			}
			return this;
		}

		//TODO add test?
		note(accent:boolean = false):StyledOut {
			if (accent) {
				this._line.write(this._style.accent(this.nibs.single));
			}
			else {
				this._line.write(this._style.plain(this.nibs.single));
			}
			return this;
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		//TODO add test?
		tweakURI(str:string):StyledOut {
			var repAccent = this._style.accent('/');
			//lame tricks
			this._line.write(str.split(/:\/\//).map((str) => {
				return str.replace(/\//g, repAccent);

			}).join(this._style.accent('://')));
			return this;
		}

		//TODO add test?
		tweakPath(str:string):StyledOut {
			this._line.write(str.replace(/\//g, this._style.accent('/')));
			return this;
		}

		// - - - - - extra api - - - - -

		//activate super-plain mode
		unfunk():StyledOut {
			this._line.flush();
			this._style = ministyle.plain();
			return this;
		}

		//flush writer
		//TODO drop finalise() cargo-cult artifact? (could be usefull although migt as well go through .writer reference)
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
