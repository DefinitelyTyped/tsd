// Type definitions for chai-json-schema 1.0.0 assert style
// Project: http://chaijs.com/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="../chai/chai-assert.d.ts" />

declare module Chai {
	export interface Assert {
		jsonSchema(value:any, schema:any, msg?:string);
		notJsonSchema(value:any, schema:any, msg?:string);
	}
}
