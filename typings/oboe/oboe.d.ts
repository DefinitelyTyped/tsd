// Type definitions for oboe 1.12.4
// Project: https://github.com/jimhigson/oboe.js/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

// TODO link to a simpler ReadableStream
/// <reference path="../node/node.d.ts" />

declare function Oboe(url: string): Oboe.Chain;
declare function Oboe(url: Oboe.Options) :Oboe.Chain;
declare function Oboe(stream: NodeJS.ReadableStream): Oboe.Chain;

declare module Oboe {

	interface Options {
		url: string;
		method?: string;
		headers?: Object;
		body?: any;
		cached?: boolean;
	}

	interface Chain extends Instance {
		on(type: string, pattern: string, callback: () => void): Chain;
		on(pattern: string, callback: () => void): Chain;

		node(pattern: string, callback: (node: any, path: string[], ancestors:any[]) => void): Chain;
		path(pattern: string, callback: (name: string) => void): Chain;

		done(callback: (json: any) => void):Chain;

		start(callback: (status: number, headers: Object) => void): Chain;
		fail(callback: (reason: Fail) => void): Chain;
	}

	// split up
	interface Instance {
		header():Object;
		header(name: string): string;
		root(): any;
		forget(): void;
		removeListener(type: string, pattern: string, f: Function): Instance;
		removeListener(pattern: string, f: Function): void;
		removeListener(f: Function): void;
		abort():void;
	}

	interface Node {
		node: any;
		statusCode?: number;
		body?: any;
		jsonBody?: any;
	}

	interface Fail {
		thrown?: Error;
		statusCode?: number;
		body?: any;
		jsonBody?: any;
	}
}

declare module 'oboe' {
export = Oboe;
}
