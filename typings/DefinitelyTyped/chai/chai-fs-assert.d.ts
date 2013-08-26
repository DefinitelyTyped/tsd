// Type definitions for chai-fs v0.0.0 assert style
// Project: http://chaijs.com/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="../chai/chai-assert.d.ts" />

declare module chai {
	interface Assert {
		basename(path:string, name:string, msg?:string);
		notBasename(path:string, name:string, msg?:string);

		dirname(path:string, name:string, msg?:string);
		notDirname(path:string, name:string, msg?:string);

		extname(path:string, name:string, msg?:string);
		notExtname(path:string, name:string, msg?:string);

		pathExists(path:string, msg?:string);
		notPathExists(path:string, msg?:string);

		isFile(path:string, msg?:string);
		notIsFile(path:string, msg?:string);

		isEmptyFile(path:string, msg?:string);
		notIsEmptyFile(path:string, msg?:string);

		isDirectory(path:string,  msg?:string);
		notIsDirectory(path:string, msg?:string);

		isEmptyDirectory(path:string, msg?:string);
		notIsEmptyDirectory(path:string, msg?:string);

		fileContent(path:string, data, msg?:string);
		notFileContent(path:string, data, msg?:string);

		jsonFile(path:string, msg?:string);
		notJsonFile(path:string, msg?:string);

		jsonSchemaFile(path:string, schema:any, msg?:string);
		notJsonSchemaFile(path:string, schema:any, msg?:string);
	}
}