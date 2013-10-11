// Type definitions for Q-io
// Project:https://github.com/kriskowal/q-io
// Definitions by:Bart van der Schoor <https://github.com/Bartvds>
// Definitions:https://github.com/borisyankov/DefinitelyTyped

///<reference path="../node/node.d.ts" />
///<reference path="Q.d.ts" />

//TODO add support for q-io/http-apps
//TODO add verified support for q-io/fs-mock
//TODO find solution for overloaded return types (QioFS.open/QioFS.read)
//     for some ideas see https://typescript.codeplex.com/discussions/461587#post1105930)

declare module QioFS {

	//TODO how to define the multiple return types? use any for now?
	export function open(path:string, options?:any):Q.Promise<any>;
	//export function open(path:string, options?:any):Q.Promise<Qio.Reader>;
	//export function open(path:string, options?:any):Q.Promise<Qio.Writer>;
	//export function open(path:string, options?:any):Q.Promise<NodeBuffer>;

	//TODO how to define the multiple return types? use any for now?
	export function read(path:string, options?:any):Q.Promise<any>;
	//export function read(path:string, options?:any):Q.Promise<string>;
	//export function read(path:string, options?:any):Q.Promise<NodeBuffer>;

	export function write(path:string, content:any, options?:any):Q.Promise<void>;
	export function write(path:NodeBuffer, content:any, options?:any):Q.Promise<void>;

	export function append(path:string, content:any, options?:any):Q.Promise<void>;
	export function append(path:NodeBuffer, content:any, options?:any):Q.Promise<void>;

	export function copy(source:string, target:string):Q.Promise<void>;
	export function copyTree(source:string, target:string):Q.Promise<void>;

	export function list(path:string):Q.Promise<string[]>;
	export function listTree(path:string, guard?:(path:string, stat) => boolean):Q.Promise<string[]>;
	export function listDirectoryTree(path:string):Q.Promise<string[]>;

	export function makeDirectory(path:string, mode?:string):Q.Promise<void>;
	export function makeDirectory(path:string, mode?:number):Q.Promise<void>;
	export function makeTree(path:string, mode?:string):Q.Promise<void>;
	export function makeTree(path:string, mode?:number):Q.Promise<void>;

	export function remove(path:string):Q.Promise<void>;
	export function removeTree(path:string):Q.Promise<void>;

	export function rename(source:string, target:string):Q.Promise<void>;
	export function move(source:string, target:string):Q.Promise<void>;

	export function link(source:string, taget):Q.Promise<void>;

	export function symbolicCopy(source:string, target:string, type):Q.Promise<void>;
	export function symbolicLink(target:string, link, type):Q.Promise<void>;

	export function chown(path:string, uid, gid):Q.Promise<void>;
	export function chmod(path:string, mode?:string):Q.Promise<void>;
	export function chmod(path:string, mode?:number):Q.Promise<void>;

	export function stat(path:string):Q.Promise<Stats>;
	export function statLink(path:string):Q.Promise<any>;
	export function statFd(fd):Q.Promise<any>;

	export function exists(path:string):Q.Promise<boolean>;

	export function isFile(path:string):Q.Promise<boolean>;
	export function isDirectory(path:string):Q.Promise<boolean>;
	export function isSymbolicLink(path:string):Q.Promise<boolean>;

	export function lastModified(path:string):Q.Promise<Date>;
	export function lastAccessed(path:string):Q.Promise<Date>;

	export function split(path:string):string[];
	export function join(...paths:string[]):string;
	export function join(paths:string[]):string;
	export function resolve(...path:string[]):string;
	export function resolve(paths:string[]):string;
	export function normal(...path:string[]):string;
	export function normal(paths:string[]):string;
	export function absolute(path:string):string;

	export function canonical(path:string):Q.Promise<string>;
	export function readLink(path:string):Q.Promise<string>;

	export function contains(parent:string, child:string):boolean;

	export function relative(source:string, target:string):Q.Promise<string>;

	export function relativeFromFile(source:string, target:string):string;
	export function relativeFromDirectory(source:string, target:string):string;

	export function isAbsolute(path:string):boolean;
	export function isRelative(path:string):boolean;
	export function isRoot(path:string):boolean;

	export function root(path:string):string;
	export function directory(path:string):string;
	export function base(path:string, extension):string;
	export function extension(path:string):string;

	//this should return a q-io/fs-mock MockFS
	export function reroot(path:string):typeof QioFS;

	export function toObject(path:string):{[path:string]:NodeBuffer};

	//listed but not implemented by Q-io
	//export function glob(pattern):Q.Promise<string[]>;
	//export function match(pattern, path:string):Q.Promise<string[]>;

	//TODO link this to node.js FS module (no lazy clones)
	interface Stats {
		isFile():boolean;
		isDirectory():boolean;
		isBlockDevice():boolean;
		isCharacterDevice():boolean;
		isSymbolicLink():boolean;
		isFIFO():boolean;
		isSocket():boolean;
		dev:number;
		ino:number;
		mode:number;
		nlink:number;
		uid:number;
		gid:number;
		rdev:number;
		size:number;
		blksize:number;
		blocks:number;
		atime:Date;
		mtime:Date;
		ctime:Date;
	}
}

declare module QioHTTP {
	export function request(request:Request):Q.Promise<Response>;
	export function request(url:string):Q.Promise<Response>;

	export function read(request:Request):Q.Promise<string>;
	export function read(url:string):Q.Promise<string >;

	export function normalizeRequest(request:Request):Request;
	export function normalizeRequest(url:string):Request;
	export function normalizeResponse(response:Response):Response;

	interface Request {
		url:string;
		path:string;
		scriptName:string;
		pathInfo:string;
		version:string[];
		method:string;
		scheme:string;

		host:string;
		port:number;
		remoteHost:string;
		remotePort:number;

		headers:Headers;
		agent:any;
		body:any;
		node:any;
	}
	interface Response {
		status:number;
		headers:Headers;
		body:QioStream.Reader
		onclose:() => void;
		node:any;
	}
	interface Headers {
		[name:string]:string;
		[name:string]:string[];
	}
	interface Body extends QioStream.Stream {

	}
	interface Application {
		(req:Request):Q.Promise<any>;
	}
}

declare module QioStream {
	interface ForEachCallback {
		(chunk:NodeBuffer):Q.Promise<any>;
		(chunk:string):Q.Promise<any>;
	}
	interface ForEach {
		forEach(callback:ForEachCallback):Q.Promise<void>;
	}

	interface Reader extends ForEach {
		read(charset:string):string;
		read():NodeBuffer;
		close():void;
		node:NodeBuffer;
	}
	interface BufferReader {
		new ():Reader;
		read(stream:Reader, charset:string):string;
		read(stream:Reader):NodeBuffer;
		join(buffers:NodeBuffer[]):NodeBuffer;
	}

	interface Writer {
		write(content:string):void;
		write(content:NodeBuffer):void;
		flush():Q.Promise<void>;
		close():void;
		destroy():void;
		node:NodeBuffer;
	}
	interface BufferWriter {
		(writer:NodeBuffer):Writer
	}

	interface Stream extends Reader, Writer {
	}
	interface BufferStream {
		(buffer:NodeBuffer, encoding:string):Stream
	}
}

declare module "q-io/http" {
export = QioHTTP;
}
declare module "q-io/fs" {
export = QioFS;
}
