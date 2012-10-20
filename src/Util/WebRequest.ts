///<reference path='..\ITTY.ts'/>

declare var require: any;

module Util { 
    export class WebRequest { 
        private _request: any = require('request');
        private _initialized: bool = false;
        private _tty: ITTY;
        private static _instance: WebRequest;

        private verifyInit() { 
            if (!this._initialized) { 
                throw new Error('WebRequest was not initialized.');
            }
        }

        public init(tty: ITTY) { 
            this._tty = tty;
            this._initialized = true;
        }

        public getUrl(url: string, callback: (data: string) => void ): void {
            this._tty.writeLine("tsd {{=green}}http {{=magenta}}GET{{=reset}} " + url);

            this._request(url, (error, response, body) => {
                this._tty.writeLine("tsd {{=green}}http {{=magenta}}" + response.statusCode + "{{=reset}} " + url);
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    this._tty.writeLine("tsd {{=red}}ERR! {{=magenta}}" + response.statusCode + " {{=reset}}" + error);
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