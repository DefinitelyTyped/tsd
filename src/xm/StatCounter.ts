/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

module xm {
	'use strict';
	/*
	 StatCounter: manages named numeric counters, handy for minimalistic stats
	 */
	export class StatCounter {

		stats:{[id:string]:number} = Object.create(null);
		log:Logger = xm.log;

		constructor(log?:Logger) {
			this.log = log;
		}

		count(id:string, label?:string):number {
			var value = (id in this.stats ? this.stats[id] + 1 : 1);
			this.stats[id] = value;

			if (this.log) {
				this.log.debug(id + ': ' + value + (label ? ': ' + label : ''));
			}
			return value;
		}

		get(id:string):number {
			if (id in this.stats) {
				return this.stats[id];
			}
			return 0;
		}

		has(id:string):boolean {
			return (id in this.stats);
		}

		zero():void {
			Object.keys(this.stats).forEach((id:string) => {
				this.stats[id] = 0;
			});
		}

		total():number {
			return Object.keys(this.stats).reduce((memo:number, id:string) => {
				return memo + this.stats[id];
			}, 0);
		}

		counterNames():string[] {
			return Object.keys(this.stats);
		}

		hasAllZero():boolean {
			return !Object.keys(this.stats).some((id:string) => {
				return this.stats[id] !== 0;
			});
		}

		clear():void {
			this.stats = Object.create(null);
		}

		getReport(label?:string):string {
			return (label ? label + ':\n' : '') + Object.keys(this.stats).sort().reduce((memo:string[], id:string) => {
				memo.push(id + ': ' + this.stats[id]);
				return memo;
			}, []).join('\n');
		}
	}
}
