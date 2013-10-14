/// <reference path="../node/node.d.ts" />

//TODO fix this typing.. lazy..

declare module MemoryStreams {

	interface Writable extends WritableStream {
		toString();
		toBuffer();
	}

	interface Readable extends ReadableStream {
		append (chunk:string, encoding?:string):void;
		append (chunk:NodeBuffer):void;
		toString();
	}
}

declare module "memory-streams" {
export = MemoryStreams;
}