///<reference path='WebDataSource.ts'/>
///<reference path='FileSystemDataSource.ts'/>

module DataSource {

    export class LibVersion {
        public version: string;
        public key: string;
        public dependencies: LibDep[];
        public uri: TsdUri;
        public author: { name: string; url: string; };
        public lib: any;
    }

    export interface LibDep { 
        name: string;
        version: string;
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
        all: (callback: (err:any, data: DataSource.Lib[]) => void ) => void;
        find: (keys: string[]) => Lib;
        content: (callback: (err: any, data: string) => void ) => any;
    }
}