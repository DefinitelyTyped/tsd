/// <reference path="../node/node.d.ts" />

declare module 'graceful-fs' {
	import fs = require('fs');
	export = fs;
}
