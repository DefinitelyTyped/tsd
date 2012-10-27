///<reference path='../Environment.ts'/>
///<reference path='IWebRequest.ts'/>
///<reference path='../../NodeJs/WebRequest.ts'/>
///<reference path='../../Wsh/WebRequest.ts'/>

module System.Web {
    export class WebHandler { 
        public static request: IWebRequest;

        public static initialize() { 
            if (Environment.isNode()) {
                WebHandler.request = new NodeJs.WebRequest();
            } else if (Environment.isWsh()) { 
                WebHandler.request = new Wsh.WebRequest();
            } else { 
                throw new Error('Invalid host');
            }
        }
    }
}