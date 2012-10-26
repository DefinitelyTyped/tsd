module System.IO { 
    export interface IFileHandle { 
        createFile(path: string): StreamWriter;
        deleteFile(path): void;
        fileExists(path): bool;
    }
}