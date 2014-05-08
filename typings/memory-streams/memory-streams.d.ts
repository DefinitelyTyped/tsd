/// <reference path="../node/node.d.ts" />

//TODO fix this typing.. lazy..
declare module 'memory-streams' {
	module MemoryStreams {

		interface Writable extends NodeJS.WritableStream {
			toString():string;
			toBuffer():Buffer;
		}

		interface Readable extends NodeJS.ReadableStream {
			append (chunk:string, encoding?:string):void;
			append (chunk:Buffer):void;
			toString():string;
		}
	}
	export = MemoryStreams;
}
