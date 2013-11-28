// Type definitions for ministyle v0.1.0
// Project: https://github.com/Bartvds/ministyle/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface MiniStyle {
	success(str:string):string;
	accent(str:string):string;
	warning(str:string):string;
	error(str:string):string;
	muted(str:string):string;
	plain(str:string):string;
}
interface MiniStyleToggle {
	enabled:boolean;
	main:MiniStyle;
	alt:MiniStyle;
	active:MiniStyle;
	swap():void;
}
interface MiniStyleStack {
	enabled:boolean;
	stack:MiniStyle[];
}
interface MiniStyleCSS {
	prefix:string;
}
interface MiniStylePeek {
	enabled:boolean;
	stack:MiniStyle[];
	main:MiniStyle;
	alt:MiniStyle;
	callback:MiniStylPeekCallback;
}
interface MiniStylPeekCallback {
	(str , def , type, main, alt):string
}
declare module MiniStyleModule {
	function assertMiniStyle(obj:any):void;
	function checkMiniStyle(obj:any):string[];
	function isMiniStyle(obj:any):boolean;
	function getStyleNames():string[];
	function setBase(obj:any):void;
	function escapeHTML(str:string):string;

	function base(str:string):MiniStyle;
	function plain(str:string):MiniStyle;
	function ansi(str:string):MiniStyle;
	function html(str:string):MiniStyle;
	function css(str:string):MiniStyleCSS;
	function dev(str:string):MiniStyle;
	function empty(str:string):MiniStyle;

	function toggle():MiniStyleToggle;
	function stack(items:MiniStyle[]):MiniStyleStack;
	function peek(callback:MiniStylPeekCallback, main, alt):MiniStylePeek;

	function colorjs():MiniStyle;
	function grunt():MiniStyle;

}
declare module "ministyle" {
export = MiniStyleModule;
}