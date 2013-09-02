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

		count(id:string, amount?:number = 1):number {
			var value = this.stats.get(id, 0) + amount;
			this.stats.set(id, value);

			if (this.log && this.logger) {
				this.logger('-> ' + id + ': ' + this.stats.get(id));
			}
			return value;
		}

		get(id:string):number {
			return this.stats.get(id, 0);
		}

		zero() {
			this.stats.keys().forEach((id:string) => {
				this.stats.set(id, 0);
			});
		}

		hasAllZero() {
			return !this.stats.values().some((value:number) => {
				return value !== 0;
			});
		}

		clear() {
			this.stats.clear();
		}

		getReport(label?:string) {
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