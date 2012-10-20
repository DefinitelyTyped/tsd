///<reference path='WebDataSource.ts'/>
///<reference path='FileSystemDataSource.ts'/>

interface IQueryLibContent {

}

class LibVersion {
	public version: string;
	public author: string;
	public url: string;
	public dependencies: IQueryLibContent[] = new IQueryLibContent[];
}

class Lib {
	public name: string;
	public description: string;
	public versions: LibVersion[] = new LibVersion[];
}

class LibContent {
	public name: string;
	public content: string;
}

interface IDataSource {
	all: (callback: (data: string) => void) => void;
	find: (keys: string[]) => Lib;
	get: (query: IQueryLibContent) => LibContent;
}