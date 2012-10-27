module System.IO { 
    export interface IDirectoryHandle { 
        directoryExists(path: string): bool;
        createDirectory(path: string): void;
        dirName(path: string): string;
        getAllFiles(path, spec?, options?): string[];
    }
}