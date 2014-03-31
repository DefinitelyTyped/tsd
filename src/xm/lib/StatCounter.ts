/// <reference path="../_ref.d.ts" />

'use strict';

/*
 StatCounter: manages named numeric counters, handy for minimalistic stats
 */
class StatCounter {

	stats: {[id:string]:number} = Object.create(null);

	constructor() {

	}

	count(id: string, label?: string): number {
		var value = (id in this.stats ? this.stats[id] + 1 : 1);
		this.stats[id] = value;
		return value;
	}

	get(id: string): number {
		if (id in this.stats) {
			return this.stats[id];
		}
		return 0;
	}

	has(id: string): boolean {
		return (id in this.stats);
	}

	zero(): void {
		Object.keys(this.stats).forEach((id: string) => {
			this.stats[id] = 0;
		});
	}

	total(): number {
		return Object.keys(this.stats).reduce((memo: number, id: string) => {
			return memo + this.stats[id];
		}, 0);
	}

	counterNames(): string[] {
		return Object.keys(this.stats);
	}

	hasAllZero(): boolean {
		return !Object.keys(this.stats).some((id: string) => {
			return this.stats[id] !== 0;
		});
	}

	clear(): void {
		this.stats = Object.create(null);
	}

	getReport(label?: string): string {
		return (label ? label + ':\n' : '') + Object.keys(this.stats).sort().reduce((memo: string[], id: string) => {
			memo.push(id + ': ' + this.stats[id]);
			return memo;
		}, []).join('\n');
	}

	getObject(): any {
		return Object.keys(this.stats).sort().reduce((memo: any, id: string) => {
			memo[id] = this.stats[id];
			return memo;
		}, Object.create(null));
	}
}

export = StatCounter;
