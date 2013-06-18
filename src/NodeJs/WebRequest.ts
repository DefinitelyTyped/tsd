///<reference path='../System/Web/IWebRequest.ts'/>
///<reference path='../System/Console.ts'/>

module NodeJs {

    export class WebRequest implements System.Web.IWebRequest { 
        private _request: any = require('request');

        public getUrl(url: string, callback: (err: any, data: string) => void ): void {
            System.Console.writeLine("tsd \033[32mhttp \033[35mGET\033[0m " + url);

            var timeStart = Date.now();

            this._request(url, (error, response, body) => {
                //console.log('-> getUrl ' +  (Date.now() - timeStart) + 'ms ' + url);

                if (error) {
                    System.Console.writeLine("tsd \033[31mERR!\033[0m \033[35mGET\033[0m Please, check your internet connection - " + error + '\n');
					callback(error, null);
                } else {
                    System.Console.writeLine("tsd \033[32mhttp \033[35m" + response.statusCode + "\033[0m " + url);

                    if (response.statusCode == 404) {
                        System.Console.writeLine("tsd \033[31mERR!\033[0m " + response.statusCode + " Not Found");
						callback({statusCode: response.statusCode, messagem: "Connection failure."}, null);
                    }  else if (!error && response.statusCode == 200) {
                        callback(null, body);
                    } else {
                        System.Console.writeLine("tsd \033[31ERR!\033[0m " + response.statusCode + " " + error);
						callback({statusCode: response.statusCode, messagem: "Connection failure."}, null);
                    }
                }
            });
        }
    }
}