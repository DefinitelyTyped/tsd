///<reference path='../System/Web/IWebRequest.ts'/>
///<reference path='../System/Console.ts'/>

module Wsh {
    export class WebRequest implements System.Web.IWebRequest {
        private request(url, callback) {
            var strResult;

            System.Console.writeLine("tsd http GET " + url);

            // Create the WinHTTPRequest ActiveX Object.
            var WinHttpReq = new ActiveXObject("WinHttp.WinHttpRequest.5.1");

            try {
                //  Create an HTTP request.
                var temp = WinHttpReq.Open("GET", url, false);

                //  Send the HTTP request.
                WinHttpReq.Send();
                System.Console.writeLine("tsd http " + WinHttpReq.statusCode + " " + url);
                //  Retrieve the response text.
                strResult = WinHttpReq.ResponseText;
            }
            catch (objError) {
                System.Console.writeLine("tsd ERR! " + WinHttpReq.statusCode + " " + objError.message);
                strResult = objError + "\n";
                strResult += "WinHTTP returned error: " + (objError.number & 0xFFFF).toString() + "\n\n";
                strResult += objError.description;
            }

            //  Return the response text.
            return callback(strResult);
        }

        public getUrl(url: string, callback: (data: string) => void ): void {
            this.request(url, callback);
        }
    }
}