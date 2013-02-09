///<reference path='../System/Web/IWebRequest.ts'/>
///<reference path='../System/Console.ts'/>

module NodeJs {

    export class WebRequest implements System.Web.IWebRequest { 
        private _request: any = require('request');

        public getUrl(url: string, callback: (data: string) => void ): void {

            System.Console.writeLine("tsd \033[32mhttp \033[35mGET\033[0m " + url);
            
            this._request(url, (error, response, body) => {
                if (error) {
                    System.Console.writeLine("tsd \033[31mERR!\033[0m \033[35mGET\033[0m Please, check your internet connection - " + error + '\n');
                } else {
                    System.Console.writeLine("tsd \033[32mhttp \033[35m" + response.statusCode + "\033[0m " + url);
                    if (!error && response.statusCode == 200) {
                        callback(body);
                    } else {
                        System.Console.writeLine("tsd \033[31ERR!\033[0m " + response.statusCode + " " + error);
                    }
                }
            });
        }
    }
}