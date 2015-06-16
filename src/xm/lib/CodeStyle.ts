/// <reference path="../_ref.d.ts" />

'use strict';

class CodeStyle {
	eol: string = '\n';
	indent: string = '  ';
	trailingEOL: boolean = true;

	clone(): CodeStyle {
		var style = new CodeStyle();
		style.eol = this.eol;
		style.indent = this.indent;
		style.trailingEOL = this.trailingEOL;
		return style;
	}
}

export = CodeStyle;
