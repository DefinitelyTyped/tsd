// Type definitions for miniwrite v0.1.0
// Project: https://github.com/Bartvds/miniwrite/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface MiniWriteLine {
	writeln(line:string):void;
}
interface MiniWriteEnable extends MiniWriteLine {
	enabled:boolean;
}
interface MiniWriteChars extends MiniWriteEnable {
	write(str:string):void;
	flush(linesOnly?:boolean):void;
	has():boolean;
	textBuffer:string;
	lineExp:RegExp;
	useTarget:(write:MiniWriteLine):void
	clear();
}
interface MiniWriteSplitter extends MiniWriteLine {
	targets:MiniWriteLine[];
}
interface MiniWriteBuffer extends MiniWriteLine {
	lines:string[];
	concat(seperator?:string, indent?:string):string;
	toString():string;
	clear();
}
interface MiniWriteMulti extends MiniWriteEnable {
	targets:MiniWriteLine[];
}
interface MiniWriteToggle extends MiniWriteEnable {
	main:MiniWriteLine;
	alt:MiniWriteLine;
	active:MiniWriteLine;
	swap():void;
}
interface MiniWritePeekCallback {
	(line:string, mw:MiniWriteLine):string;
}
interface MiniWritePeek extends MiniWriteEnable {
	target:MiniWriteLine;
	callback:MiniWritePeekCallback;
}
declare module MiniWriteModule {
	function assertMiniWrite(obj:any):void;
	function isMiniWrite(obj:any):boolean;

	function setBase(obj:any):void

	function base():MiniWriteLine;
	function chars(target:MiniWriteLine):MiniWriteChars;
	function splitter(target:MiniWriteLine):MiniWriteSplitter;

	function buffer(patch?:any):MiniWriteBuffer;
	function log(patch?:any):MiniWriteLine;

	//TODO what to do with node stream?
	function stream(nodeStream:any):MiniWriteLine;

	function toggle(main:MiniWriteLine, alt?:MiniWriteLine):MiniWriteToggle;
	function multi(targets?:MiniWriteLine[]):MiniWriteMulti;
	function peek(target:MiniWriteLine, callback:MiniWritePeekCallback):MiniWritePeek;

	function grunt(grunt:any, verbose?:boolean, patch?:any):MiniWriteLine;
}
declare module "miniwrite" {
export = MiniWriteModule;
}
