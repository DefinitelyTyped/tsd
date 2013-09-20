/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */
module xm {
	/*
	 StatCounter: manages named numeric counters, handy for minimalistic stats
	 */
	export class StatCounter {

		stats:KeyValueMap = new KeyValueMap();
		logger:Logger = xm.log;

		constructor(public log:bool = false) {

		}

		count(id:string, label?:string):number {
			var value = this.stats.get(id, 0) + 1;
			this.stats.set(id, value);

			if (this.log && this.logger) {
				this.logger('-> ' + id + ': ' + this.stats.get(id) + (label ? ': ' + label : ''));
			}
			return value;
		}

		get(id:string):number {
			return this.stats.get(id, 0);
		}

		has(id:string):bool {
			return this.stats.has(id);
		}

		zero():void {
			this.stats.keys().forEach((id:string) => {
				this.stats.set(id, 0);
			});
		}

		total():number {
			return this.stats.values().reduce((memo:number, value:number) => {
				return memo + value;
			}, 0);
		}

		counterNames():string[] {
			return this.stats.keys();
		}

		hasAllZero():bool {
			return !this.stats.values().some((value:number) => {
				return value !== 0;
			});
		}

		clear():void {
			this.stats.clear();
		}

		getReport(label?:string):string {
			var ret = [];
			var keys = this.stats.keys();
			keys.sort();
			keys.forEach((id:string) => {
				ret.push(id + ': ' + this.stats.get(id));
			});
			return (label ? label + ':\n' : '') + ret.join('\n');
		}
	}
}