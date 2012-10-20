///<reference path='WebDataSource.ts'/>
///<reference path='FileSystemDataSource.ts'/>

module DataSource {

    export class LibVersion {
        public version: string;
        public author: string;
        public url: string;
        public dependencies: any[] = [];
    }

    export class Lib {
        public name: string;
        public description: string;
        public versions: LibVersion[] = new LibVersion[];
    }

    export class LibContent {
        public name: string;
        public content: string;
    }

    export interface IDataSource {
        all: (callback: (data: string) => void ) => void;
        find: (keys: string[]) => Lib;
    }
}