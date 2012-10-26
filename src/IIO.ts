interface IIO {
	readFile(path: string): string;
    //createFile(path: string, contents: string): void;
    //deleteFile(path: string): void;
    //fileExists(path: string): bool;
    directoryExists(path: string): bool;
    createDirectory(path: string): void;
    dirName(path: string): string;
}