/// <reference path="../node/node.d.ts" />

declare module 'readdir-stream' {
	import fs = require('fs');
	import stream = require('stream');

	function readdir(dir: string): NodeJS.ReadableStream;

	module readdir {
		export interface Element {
			path: string;
			stat: fs.Stats;
		}
	}

	export = readdir;
}
