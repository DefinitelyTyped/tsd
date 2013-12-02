/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../_ref.d.ts" />
///<reference path="../ObjectUtil.ts" />
///<reference path="../io/StyledOut.ts" />
///<reference path="Expose.ts" />

/*
 Expose: cli command manager and help generator
 */
module xm {
	'use strict';

	var Q:typeof Q = require('q');

	/*
	 ExposeContext: access the parameters of a single call
	 */
	//TODO should have a reject/resolve method
	//TODO add assertion mode (hardcore verification for dev/test)
	//TODO drop optimist for something simpler
	export class ExposeContext {

		expose:Expose;
		command:ExposeCommand;
		argv:any;
		out:xm.StyledOut;

		constructor(expose:Expose, argv, command?:ExposeCommand) {
			this.expose = expose;
			this.command = command;
			this.argv = argv;
			//TODO maybe keep reporter instead of out?
			this.out = this.expose.reporter.output;
		}

		hasOpt(name:string, strict:boolean = false):any {
			if (xm.hasOwnProp(this.argv, name)) {
				if (strict && !this.expose.options.has(name)) {
					return false;
				}
				return true;
			}
			return false;
		}

		getOptRaw(name:string, alt?:any):any {
			if (xm.hasOwnProp(this.argv, name)) {
				return this.argv[name];
			}
			return alt;
		}

		getOpt(name:string, alt?:any):any {
			if (this.hasOpt(name)) {
				var option = this.expose.options.get(name);
				if (option ) {
					if (option.type) {
						// unhack optimist flags
						if (!xm.isUndefined(option.default) && typeof this.argv[name] === 'boolean' && (option.type !== 'boolean' && option.type !== 'flag')) {
							return this.getDefault(name, xm.convertStringTo(this.argv[name], option.type));
						}
						return xm.convertStringTo(this.argv[name], option.type);
					}
				}
				return this.argv[name];
			}
			return this.getDefault(name, alt);
		}

		getOptAs(name:string, type:string, alt?:any):any {
			if (this.hasOpt(name)) {
				return xm.convertStringTo(this.argv[name], type);
			}
			return this.getDefault(name, alt);
		}

		getOptNames(strict:boolean = false):string[] {
			return Object.keys(this.argv).filter((name:string) => {
				return (name !== '_' && this.hasOpt(name, strict));
			});
		}

		getOptEnum(name:string, alt?:any):any {
			if (this.hasOpt(name)) {
				if (this.expose.options.has(name)) {
					var option = this.expose.options.get(name);
					var value = this.getOpt(name);
					if (option.enum && option.enum.indexOf(value) > -1) {
						return value;
					}
				}
			}
			return alt;
		}

		getDefault(name:string, alt?:any):any {
			var option = this.expose.options.get(name);
			if (option && !xm.isUndefined(option.default)) {
				return option.default;
			}
			return alt;
		}

		isDefault(name:string):boolean {
			if (this.hasOpt(name, true)) {
				var def = this.expose.options.get(name).default;
				if (!xm.isUndefined(def)) {
					return (def === this.getOpt(name));
				}
			}
			return false;
		}

		getArgAt(index:number, alt?:any):any {
			if (index >= 0 && index < this.argv._.length) {
				return this.argv._[index];
			}
			return alt;
		}

		//(booya!)
		getArgAtAs(index:number, type:string, alt?:any):any {
			if (index >= 0 && index < this.argv._.length) {
				return xm.convertStringTo(this.argv._[index], type);
			}
			return alt;
		}

		//(gasp!)
		getArgsAs(type:string):any[] {
			return this.argv._.map((value:string) => {
				return xm.convertStringTo(value, type);
			});
		}

		shiftArg(alt?:string):any {
			if (this.argv._.length > 0) {
				return this.argv._.shift();
			}
			return alt;
		}

		shiftArgAs(type:string, alt?:string):any {
			if (this.argv._.length > 0) {
				return xm.convertStringTo(this.argv._.shift(), type);
			}
			return alt;
		}

		getArgs(alt?:string):any {
			if (this.argv._.length > 0) {
				return this.argv._.shift();
			}
			return alt;
		}

		get numArgs():number {
			return this.argv._.length;
		}
	}
}
