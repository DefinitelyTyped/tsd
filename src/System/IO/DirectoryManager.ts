///<reference path='../Environment.ts'/>
///<reference path='IDirectoryHandle.ts'/>
///<reference path='../../NodeJs/ConsoleWriter.ts'/>
///<reference path='../../Wsh/ConsoleWriter.ts'/>
///<reference path='../../NodeJs/DirectoryHandle.ts'/>
///<reference path='../../Wsh/DirectoryHandle.ts'/>

module System.IO { 
    export class DirectoryManager { 
        private static handle: IDirectoryHandle;

        public static initialize() { 
            if (Environment.isNode()) {
                DirectoryManager.handle = new NodeJs.DirectoryHandle();
            } else if (Environment.isWsh()) { 
                DirectoryManager.handle = new Wsh.DirectoryHandle();
            } else { 
                throw new Error('Invalid host');
            }
        }
    }
}