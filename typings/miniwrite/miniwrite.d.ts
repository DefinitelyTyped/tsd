// Type definitions for miniwrite v0.1.0
// Project: https://github.com/Bartvds/miniwrite/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
declare module MiniWrite {

	interface Line {
		writeln(line:string):void;
	}
	interface Enable extends Line {
		enabled:boolean;
	}

	interface Chars extends Enable {
		write(str:string):void;
		flush(linesOnly?:boolean):void;
		has():boolean;
		textBuffer:string;
		lineExp:RegExp;
		useTarget(write:Line):void;
		clear();
	}
	interface Splitter extends Line {
		target:Line;
	}
	interface Buffer extends Line {
		lines:string[];
		concat(seperator?:string, indent?:string, appendSep?:boolean):string;
		toString():string;
		clear();
	}
	interface Multi extends Enable {
		targets:Line[];
	}
	interface Toggle extends Enable {
		main:Line;
		alt:Line;
		active:Line;
		swap():void;
	}

	interface PeekCallback {
		(line:string, mw:Line):string;
	}
	interface Peek extends Enable {
		target:Line;
		callback:PeekCallback;
	}

	function assertMiniWrite(obj:any):void;
	function isMiniWrite(obj:any):boolean;

	function setBase(obj:any):void

	function base():Line;
	function chars(target:Line):Chars;
	function splitter(target:Line):Splitter;

	function buffer(patch?:any):Buffer;
	function log(patch?:any):Line;

	//TODO what to do with node stream?
	function stream(nodeStream:any):Line;

	function toggle(main:Line, alt?:Line):Toggle;
	function multi(targets?:Line[]):Multi;
	function peek(target:Line, callback:PeekCallback):Peek;

	function grunt(grunt:any, verbose?:boolean, patch?:any):Line;
}
declare module "miniwrite" {
export = MiniWrite;
}
