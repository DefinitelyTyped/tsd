module System.IO { 
    export interface IFileHandle { 
        readFile(path: string): string;
        createFile(path: string): StreamWriter;
        deleteFile(path): void;
        fileExists(path): bool;
    }
}