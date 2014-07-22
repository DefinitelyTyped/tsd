// Type definitions for chai-fuzzy v1.6.0 assert style
// Project: http://chaijs.com/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="../chai/chai.d.ts" />

declare module chai {
	export interface Assert {
		like(act:any, exp:any, msg?:string):void;
		notLike(act:any, exp:any, msg?:string):void;
		containOneLike(act:any, exp:any, msg?:string):void;
		notContainOneLike(act:any, exp:any, msg?:string):void;
		jsonOf(act:any, exp:any, msg?:string):void;
		notJsonOf(act:any, exp:any, msg?:string):void;
	}
}
