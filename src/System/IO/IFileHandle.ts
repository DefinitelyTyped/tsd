module System.IO { 
    export interface IFileHandle { 
        readFile(path: string): string;
        createFile(path: string): StreamWriter;
        deleteFile(path): void;
        fileExists(path): bool;
        writeFile(path: string, content:string): void;
    }
}