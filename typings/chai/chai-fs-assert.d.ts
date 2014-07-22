// Type definitions for chai-fs v0.0.0 assert style
// Project: http://chaijs.com/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="../chai/chai.d.ts" />

declare module chai {
	export interface Assert {
		basename(path:string, name:string, msg?:string):void;
		notBasename(path:string, name:string, msg?:string):void;

		dirname(path:string, name:string, msg?:string):void;
		notDirname(path:string, name:string, msg?:string):void;

		extname(path:string, name:string, msg?:string):void;
		notExtname(path:string, name:string, msg?:string):void;

		pathExists(path:string, msg?:string):void;
		notPathExists(path:string, msg?:string):void;

		isFile(path:string, msg?:string):void;
		notIsFile(path:string, msg?:string):void;

		isEmptyFile(path:string, msg?:string):void;
		notIsEmptyFile(path:string, msg?:string):void;

		isDirectory(path:string,  msg?:string):void;
		notIsDirectory(path:string, msg?:string):void;

		isEmptyDirectory(path:string, msg?:string):void;
		notIsEmptyDirectory(path:string, msg?:string):void;

		fileContent(path:string, data:string, msg?:string):void;
		fileContent(path:string, data:Buffer, msg?:string):void;
		notFileContent(path:string, data:string, msg?:string):void;
		notFileContent(path:string, data:Buffer, msg?:string):void;

		jsonFile(path:string, msg?:string):void;
		notJsonFile(path:string, msg?:string):void;

		jsonSchemaFile(path:string, schema:any, msg?:string):void;
		notJsonSchemaFile(path:string, schema:any, msg?:string):void;
	}
}
