///<reference path='../System/Web/IWebRequest.ts'/>
///<reference path='../System/Console.ts'/>

module NodeJs { 
    export class WebRequest implements System.Web.IWebRequest { 
        private _request: any = require('request');

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
    }
}