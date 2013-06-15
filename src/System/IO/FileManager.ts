///<reference path='../Environment.ts'/>
///<reference path='IFileHandle.ts'/>
///<reference path='StreamWriter.ts'/>
///<reference path='../../NodeJs/ConsoleWriter.ts'/>
///<reference path='../../NodeJs/FileHandle.ts'/>

module System.IO { 
    export class FileManager { 
        public static handle: IFileHandle;

        public static initialize() { 
            FileManager.handle = new NodeJs.FileHandle();
        }
    }
}