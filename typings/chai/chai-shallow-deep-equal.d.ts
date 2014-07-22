// Type definitions for chai-shallow-deep-equal v0.0.3 assert style
// Project: https://github.com/michelsalib/chai-shallow-deep-equal
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="../chai/chai.d.ts" />

declare module chai {
	export interface Assert {
		shallowDeepEqual(act:any, exp:any, msg?:string):void;
	}
}
