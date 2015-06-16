// Type definitions for ministyle v0.1.0
// Project: https://github.com/Bartvds/ministyle/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module "ministyle" {
	interface Style {
		success(str:string):string;
		accent(str:string):string;
		signal(str:string):string;
		warning(str:string):string;
		error(str:string):string;
		muted(str:string):string;
		plain(str:string):string;
	}

	interface StyleEnable extends Style {
		enabled:boolean;
	}

	interface StyleToggle extends StyleEnable {
		main:Style;
		alt:Style;
		active:Style;
		swap():void;
	}
	interface StyleStack extends StyleEnable {
		stack:Style[];
	}
	interface StyleCSS extends StyleEnable {
		prefix:string;
	}
	interface StylePeek extends StyleEnable {
		main:Style;
		alt:Style;
		callback:StylePeekCallback;
	}
	interface StylePeekCallback {
		(str:string , def:(str:string) => string , type:string, main:Style, alt:Style):string
	}

	function assertMiniStyle(obj:any):void;
	function checkMiniStyle(obj:any):string[];
	function isSMiniStyle(obj:any):boolean;
	function getStyleNames():string[];
	function setBase(obj:any):void;
	function escapeHTML(str:string):string;

	function base():Style;
	function plain():Style;
	function ansi():Style;
	function html(escape?:boolean):Style;
	function css(classPrefix?:string, escape?:boolean):StyleCSS;
	function dev():Style;
	function empty():Style;

	function toggle():StyleToggle;
	function stack(items:Style[]):StyleStack;
	function peek(callback:StylePeekCallback, main:Style, alt:Style):StylePeek;

	function colorjs():Style;
	function grunt():Style;
}
