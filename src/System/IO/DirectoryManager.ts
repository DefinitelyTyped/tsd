///<reference path='../Environment.ts'/>
///<reference path='IDirectoryHandle.ts'/>
///<reference path='../../NodeJs/ConsoleWriter.ts'/>
///<reference path='../../NodeJs/DirectoryHandle.ts'/>

module System.IO { 
    export class DirectoryManager { 
        private static handle: IDirectoryHandle = new NodeJs.DirectoryHandle();
    }
}