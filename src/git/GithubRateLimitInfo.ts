
///<reference path="../xm/typeOf.ts" />


module git {


	export class GitRateLimitInfo {

		limit:number = 0;
		remaining:number = 0;
		lastUpdate:Date = new Date();

		constructor() {

		}

		readFromRes(response:any) {
			if (response && xm.isObject(response.meta)) {
				if (response.meta.hasOwnProperty('x-ratelimit-limit')) {
					this.limit = parseInt(response.meta['x-ratelimit-limit'], 10);
				}
				if (response.meta.hasOwnProperty('x-ratelimit-remaining')) {
					this.remaining = parseInt(response.meta['x-ratelimit-remaining'], 10);
				}
				this.lastUpdate = new Date();
			}
		}

		toStatus():string {
			return 'rate limit: ' + this.remaining + ' of ' + this.limit + ' @ ' + this.lastUpdate.toLocaleString();
		}

		hasRemaining():bool {
			return this.remaining > 0;
		}
	}
}