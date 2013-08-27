///<reference path="../_ref.ts" />
///<reference path="Definition.ts" />

module tsd {

	export class DefVersion {

		public blobSha:string;
		// commitSha should be an array? as a blob can exist in many commits
		public commitSha:string;
		//public date:Date;
		public def:tsd.Definition;

		public content:string;

		// linked list (only care for single chain
		public newer:tsd.DefVersion;
		public older:tsd.DefVersion;

		constructor(def:tsd.Definition, blobSha:string, commitSha:string) {
			this.def = def;
			this.blobSha = blobSha;
			this.commitSha = commitSha;
		}

		get head():tsd.DefVersion {
			var def:tsd.DefVersion = this;
			while (def.newer) {
				def = def.newer;
			}
			return def;
		}

		get short():string {
			return (this.blobSha ? this.blobSha.substr(0, 8) : '<no sha>');
		}

		toString():string {
			var str = (this.def ? this.def.path : '<no file>');
			str += ' : ' + (this.blobSha ? this.blobSha.substr(0, 8) : '<no sha>');
			//str += (this.date ? ' : ' + this.date.toString() : '');
			return str;
		}
	}
}