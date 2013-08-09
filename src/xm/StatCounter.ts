module xm {
	export class StatCounter {

		stats:KeyValueMap = new KeyValueMap();

		constructor(public log:bool) {

		}

		count(id:string, amount?:number = 1) {
			this.stats.set(id, this.stats.get(id, 0) + amount);

			if (this.log) {
				console.log('-> ' + id + ': ' + this.stats.get(id));
			}
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
				return value != 0;
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