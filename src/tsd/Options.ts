module tsd {
	/*
	 Options: bundles options
	 */
	export class Options {

		minMatches:number = 0;
		maxMatches:number = 0;
		limitApi:number = 5;

		resolveDependencies:boolean = false;
		overwriteFiles:boolean = false;
		saveToConfig:boolean = false;

		//TODO implement timeout (limitless powerr!)
		timeout:number = 10000;

		static main = Object.freeze(new Options());
	}
}
