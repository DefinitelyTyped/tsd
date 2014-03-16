/// <reference path="../node/node.d.ts" />

//TODO fix this typing.. lazy..
declare module 'memory-streams' {
	module MemoryStreams {

		interface Writable extends WritableStream {
			toString():string;
			toBuffer():NodeBuffer;
		}

		interface Readable extends ReadableStream {
			append (chunk:string, encoding?:string):void;
			append (chunk:NodeBuffer):void;
			toString():string;
		}
	}
	export = MemoryStreams;
}
