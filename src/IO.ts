///<reference path='IIO.ts'/>

declare var require: any;

class IO implements IIO {
    private _fs = require('fs');
    private  _path = require('path');
    private  _module = require('module');

    public readFile(file): string {
        var buffer = this._fs.readFileSync(file);
        switch (buffer[0]) {
            case 0xFE:
                if (buffer[1] == 0xFF) {
                    // utf16-be. Reading the buffer as big endian is not supported, so convert it to 
                    // Little Endian first
                    var i = 0;
                    while ((i + 1) < buffer.length) {
                        var temp = buffer[i]
                        buffer[i] = buffer[i + 1];
                        buffer[i + 1] = temp;
                        i += 2;
                    }
                    return buffer.toString("ucs2", 2);
                }
                break;
            case 0xFF:
                if (buffer[1] == 0xFE) {
                    // utf16-le 
                    return buffer.toString("ucs2", 2);
                }
                break;
            case 0xEF:
                if (buffer[1] == 0xBB) {
                    // utf-8
                    return buffer.toString("utf8", 3);
                }
        }
        // Default behaviour
        return buffer.toString();
    }

    //public createFile(path: string, contents: string): void {
    //	this._fs.writeFileSync(path, contents);
    //}

    //public deleteFile(path): void {
    //    try {
    //        this._fs.unlinkSync(path);
    //    } catch (e) {

    //    }
    //}

    //public fileExists(path): bool {
    //    return this._fs.existsSync(path);
    //}

    public directoryExists(path: string): bool {
        return this._fs.existsSync(path) && this._fs.lstatSync(path).isDirectory();
    }

    public createDirectory(path): void {
        if (!this.directoryExists(path)) {
            this._fs.mkdirSync(path);
        }
    }
    
    public dirName(path: string): string {
        return this._path.dirname(path);
    }    
}