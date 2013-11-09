///<reference path="../../xm/typeOf.ts" />
///<reference path="../../xm/ObjectUtil.ts" />

module git {
	'use strict';

	export class GitRateLimitInfo {

		limit:number = 0;
		remaining:number = 0;
		lastUpdate:Date = new Date();

		constructor() {

		}

		readFromRes(response:any) {
			//TODO assert rate limit extraction?
			if (response && xm.isObject(response.meta)) {
				if (xm.ObjectUtil.hasOwnProp(response.meta, 'x-ratelimit-limit')) {
					this.limit = parseInt(response.meta['x-ratelimit-limit'], 10);
				}
				if (xm.ObjectUtil.hasOwnProp(response.meta, 'x-ratelimit-remaining')) {
					this.remaining = parseInt(response.meta['x-ratelimit-remaining'], 10);
				}
				this.lastUpdate = new Date();
			}
		}

		toStatus():string {
			return 'rate limit: ' + this.remaining + ' of ' + this.limit + ' @ ' + this.lastUpdate.toLocaleString();
		}

		hasRemaining():boolean {
			return this.remaining > 0;
		}
	}
}
