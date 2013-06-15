///<reference path='../Environment.ts'/>
///<reference path='IDirectoryHandle.ts'/>
///<reference path='../../NodeJs/ConsoleWriter.ts'/>
///<reference path='../../NodeJs/DirectoryHandle.ts'/>

module System.IO { 
    export class DirectoryManager { 
        private static handle: IDirectoryHandle;

        public static initialize() { 
            DirectoryManager.handle = new NodeJs.DirectoryHandle();
        }
    }
}