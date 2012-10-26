
declare var require: any;

module System.Web { 
    export class WebRequest { 
        private _request: any = require('request');
        private _initialized: bool = false;
        private static _instance: WebRequest;

        public getUrl(url: string, callback: (data: string) => void ): void {

            System.Console.writeLine("tsd http GET " + url);

            this._request(url, (error, response, body) => {
                System.Console.writeLine("tsd http " + response.statusCode + " " + url);
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    System.Console.writeLine("tsd ERR! " + response.statusCode + " " + error);
                }
            });
        }

        public static instance(): WebRequest { 
            if (WebRequest._instance == null) { 
                WebRequest._instance = new WebRequest();
            }
            return WebRequest._instance;
        }
    }
}