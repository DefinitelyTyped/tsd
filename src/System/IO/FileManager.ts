///<reference path='../Environment.ts'/>
///<reference path='IFileHandle.ts'/>
///<reference path='StreamWriter.ts'/>
///<reference path='../../NodeJs/ConsoleWriter.ts'/>
///<reference path='../../Wsh/ConsoleWriter.ts'/>
///<reference path='../../NodeJs/FileHandle.ts'/>
///<reference path='../../Wsh/FileHandle.ts'/>

module System.IO { 
    export class FileManager { 
        public static handle: IFileHandle;

        public static initialize() { 
            if (Environment.isNode()) {
                FileManager.handle = new NodeJs.FileHandle();
            } else if (Environment.isWsh()) { 
                FileManager.handle = new Wsh.FileHandle();
            } else { 
                throw new Error('Invalid host');
            }
        }
    }
}