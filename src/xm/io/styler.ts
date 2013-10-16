/*
 styler lifted from my own mocha-unfunk-reporter
 https://github.com/Bartvds/mocha-unfunk-reporter/
 MIT
 */
/*
 color codes taken from:
 colors.js
 Copyright (c) 2010
 Marak Squires & Alexis Sellier (cloudhead)
 https://github.com/marak/colors.js/
 MIT
 */
module xm {

	//TODO ditch wrap and hardcode or auto-compile style table lookups (for sanity) <partially implemented>
	export module styler {

		function clean(str:string):string {
			return '' + str;
		}

		export interface Styler {

			ok(str:string):string;
			fail(str:string):string;
			warn(str:string):string;

			error(str:string):string;
			warning(str:string):string;
			success(str:string):string;

			accent(str:string):string;
			plain(str:string):string;
			//empty string
			zero(str?:string):string;
		}

		export class NoStyler implements Styler {

			ok(str:string):string {
				return clean(str);
			}

			fail(str:string):string {
				return clean(str);
			}

			warn(str:string):string {
				return clean(str);
			}

			error(str:string):string {
				return clean(str);
			}

			warning(str:string):string {
				return clean(str);
			}

			success(str:string):string {
				return clean(str);
			}

			accent(str:string):string {
				return clean(str);
			}

			plain(str:string):string {
				return clean(str);
			}

			zero():string {
				return '';
			}
		}

		export class PlainStyler extends NoStyler {

			ok(str:string):string {
				return clean(str).toLocaleUpperCase();
			}

			warn(str:string):string {
				return clean(str).toLocaleUpperCase();
			}

			fail(str:string):string {
				return clean(str).toLocaleUpperCase();
			}
		}

		export class WrapStyler implements Styler {

			styles:any = {};

			ok(str:string):string {
				return this.success(clean(str));
			}

			warn(str:string):string {
				return this.warning(clean(str));
			}

			fail(str:string):string {
				return this.error(clean(str));
			}

			error(str:string):string {
				return this.wrap(clean(str), 'red');
			}

			warning(str:string):string {
				return this.wrap(clean(str), 'yellow');
			}

			success(str:string):string {
				return this.wrap(clean(str), 'green');
			}

			accent(str:string):string {
				return this.wrap(clean(str), 'cyan');
			}

			plain(str:string):string {
				return clean(str);
			}

			zero():string {
				return '';
			}

			wrap(str:string, style:string):string {
				if (!this.styles.hasOwnProperty(style)) {
					return clean(str);
				}
				var tmp = this.styles[style];
				return tmp[0] + clean(str) + tmp[1];
			}
		}

		export var ansiWrapTable = {
			//styles
			'bold': ['\033[1m', '\033[22m'],
			'italic': ['\033[3m', '\033[23m'],
			'underline': ['\033[4m', '\033[24m'],
			'inverse': ['\033[7m', '\033[27m'],
			//grayscale
			'white': ['\033[37m', '\033[39m'],
			'grey': ['\033[90m', '\033[39m'],
			'black': ['\033[30m', '\033[39m'],
			//colors
			'blue': ['\033[34m', '\033[39m'],
			'cyan': ['\033[36m', '\033[39m'],
			'green': ['\033[32m', '\033[39m'],
			'magenta': ['\033[35m', '\033[39m'],
			'red': ['\033[31m', '\033[39m'],
			'yellow': ['\033[33m', '\033[39m']
		};

		export class ANSIWrapStyler extends WrapStyler {
			constructor() {
				super();
				this.styles = ansiWrapTable;
			}
		}

		export class ANSIStyler implements Styler {

			//hardcode speedfreaks
			ok(str:string):string {
				return '\033[32m' + clean(str) + '\033[39m';
			}

			fail(str:string):string {
				return '\033[31m' + clean(str) + '\033[39m';
			}

			warn(str:string):string {
				return '\033[33m' + clean(str) + '\033[39m';
			}

			error(str:string):string {
				return '\033[31m' + clean(str) + '\033[39m';
			}

			warning(str:string):string {
				return '\033[33m' + clean(str) + '\033[39m';
			}

			success(str:string):string {
				return '\033[32m' + clean(str) + '\033[39m';
			}

			accent(str:string):string {
				return '\033[36m' + clean(str) + '\033[39m';
			}

			plain(str:string):string {
				return clean(str);
			}

			zero():string {
				return '';
			}
		}

		export var htmlWrapTable = {
			//styles
			'bold': ['<b>', '</b>'],
			'italic': ['<i>', '</i>'],
			'underline': ['<u>', '</u>'],
			'inverse': ['<span style="background-color:black;color:white;">', '</span>'],
			//grayscale
			'white': ['<span style="color:white;">', '</span>'],
			'grey': ['<span style="color:grey;">', '</span>'],
			'black': ['<span style="color:black;">', '</span>'],
			//colors
			'blue': ['<span style="color:blue;">', '</span>'],
			'cyan': ['<span style="color:cyan;">', '</span>'],
			'green': ['<span style="color:green;">', '</span>'],
			'magenta': ['<span style="color:magenta;">', '</span>'],
			'red': ['<span style="color:red;">', '</span>'],
			'yellow': ['<span style="color:yellow;">', '</span>']
		};

		export class HTMLWrapStyler extends WrapStyler {
			constructor() {
				super();
				this.styles = htmlWrapTable;
			}
		}

		export class CSSStyler extends WrapStyler {

			prefix:string;

			constructor(prefix?:string) {
				super();
				if (typeof prefix === 'string') {
					this.prefix = prefix;
				}
				else {
					this.prefix = 'styler-';
				}
			}

			ok(str:string):string {
				return this.wrap(str, 'ok');
			}

			warn(str:string):string {
				return this.wrap(str, 'warn');
			}

			fail(str:string):string {
				return this.wrap(str, 'fail');
			}

			error(str:string):string {
				return this.wrap(str, 'error');
			}

			warning(str:string):string {
				return this.wrap(str, 'warning');
			}

			success(str:string):string {
				return this.wrap(str, 'success');
			}

			accent(str:string):string {
				return this.wrap(str, 'accent');
			}

			plain(str:string):string {
				return this.wrap(str, 'plain');
			}

			wrap(str:string, style:string):string {
				return '<span class="' + this.prefix + style + '">' + clean(str) + '</span>';
			}
		}

		export class DevStyler implements Styler {

			ok(str:string):string {
				return '[ok|' + clean(str) + ']';
			}

			fail(str:string):string {
				return '[fail|' + clean(str) + ']';
			}

			warn(str:string):string {
				return '[warn|' + clean(str) + ']';
			}

			error(str:string):string {
				return '[error|' + clean(str) + ']';
			}

			warning(str:string):string {
				return '[warning|' + clean(str) + ']';
			}

			success(str:string):string {
				return '[success|' + clean(str) + ']';
			}

			accent(str:string):string {
				return '[accent|' + clean(str) + ']';
			}

			plain(str:string):string {
				return '[plain|' + clean(str) + ']';
			}

			zero():string {
				return '[zero]';
			}
		}
	}
}
