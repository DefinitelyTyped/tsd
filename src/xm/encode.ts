module xm {
	var util = require('util');
	var jsesc = require('jsesc');

	var stringExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
	var stringEsc = {
		quotes: 'double'
	};
	var stringEscWrap = {
		json: true,
		quotes: 'double',
		wrap: true
	};
	var stringQuote = '"';

	var identExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
	var identAnyExp = /^[a-z0-9](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
	var identEscWrap = {
		quotes: 'double',
		wrap: true
	};
	var intExp = /^\d+$/;

	var escapeRep = '\\$&';
	var escapeAdd = '\\$&$&';

	function splitFix(chars:string):string[] {
		return chars.split('').map((char:string) => {
			return '\\' + char;
		});
	}

	function getReplacerFunc(chars:string[], values:string[], addSelf:boolean = false) {
		return function (match) {
			var i = chars.indexOf(match);
			if (i > -1 && i < values.length) {
				return values[i] + (addSelf ? match : '');
			}
			return match;
		};
	}

	//TODO is there no better way then this crude thing?
	var nonPrintExp = /[\b\f\n\r\t\v\0\\]/g;
	var nonPrintChr = '\b\f\n\r\t\v\0\\'.split('');
	var nonPrintVal = splitFix('bfnrtv0\\');
	var nonPrintRep = getReplacerFunc(nonPrintChr, nonPrintVal);

	var nonPrintNotNLExp = /[\b\f\t\v\0\\]/g;
	var nonPrintNotNLChr = '\b\f\t\v\\'.split('');
	var nonPrintNotNLVal = splitFix('bftv0\\');
	var nonPrintNotNLRep = getReplacerFunc(nonPrintNotNLChr, nonPrintNotNLVal);

	var nonPrintNLExp = /[\r\n]/g;
	var nonPrintNLChr = ['\n', '\r'];
	var nonPrintNLVal = ['\\n', '\\r'];
	var nonPrintNLRep = getReplacerFunc(nonPrintNLChr, nonPrintNLVal);

	export function wrapIfComplex(input:string, args?:any):string {
		if (!identAnyExp.test(String(input))) {
			return jsesc(input, args || stringEscWrap);
		}
		return input;
	}

	export function stringDebug(input:string, newline:boolean = false):string {
		if (newline) {
			//TODO remove this crazy
			return input.replace(nonPrintNotNLExp, nonPrintNotNLRep).replace(nonPrintNLExp, getReplacerFunc(nonPrintNLChr, nonPrintNLVal, true));
		}
		return input.replace(nonPrintExp, nonPrintRep);
	}
}
