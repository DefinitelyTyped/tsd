module tsd {

	export class APIMessage {
		message:string;
		tag:string;

		constructor(message:string, tag:string) {
			this.message = message;
			this.tag = tag;
		}

		toString() {
			return this.tag + ':' + this.message;
		}
	}

	export class APIProgress extends APIMessage {
		total:number;
		current:number;

		constructor(message:string, code:string, total:number = 0, current:number = 0) {
			super(message, code);
			this.total = total;
			this.current = current;
		}

		getRatio():number {
			if (this.total > 0) {
				return Math.min(Math.max(0, this.current), this.total) / this.total;
			}
			return 0;
		}

		getPerc():string {
			return Math.round(this.getRatio() * 100) + '%';
		}

		getOf():string {
			return this.current + '/' + this.total;
		}

		toString() {
			return super.toString() + ':';
		}
	}
}
