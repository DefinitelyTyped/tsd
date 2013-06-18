///<reference path='../typings/DefinitelyTyped/node/node.d.ts'/>
///<reference path='System/Console.ts'/>
///<reference path='System/IO/FileManager.ts'/>
///<reference path='System/Web/WebHandler.ts'/>

///<reference path='Command\Helper.ts'/>
///<reference path='Command\InstallCommand.ts'/>
///<reference path='CommandLineProcessor.ts'/>
///<reference path='DataSource/DataSourceFactory.ts'/>

///<reference path='Config.ts'/>
///<reference path='DataSource\DataSourceFactory.ts'/>

//enhance String.prototype with colors
require('colors');

class Main { 
    public run(args: Array) { 

        try { 
            var cfg = new Config();
            cfg.load();
            var cp = new CommandLineProcessor(cfg);
            cp.execute(args);
        } catch(e){
            System.Console.writeLine(e.message);
            System.Console.writeLine("");
        }
    }
}

class ApiLogger extends System.IO.StreamWriter {

    constructor(public proxy: any) {
        super();
    }

    public write(value: string): void {
        if (value)
            this.proxy.logger.log(value);
    }

    public writeLine(value: string): void {
        if (value)
            this.proxy.logger.log(value);
    }

    public flush(): void {
    }

    public flushAsync(callback: () => void ): void {
    }

    public dispose(): void {
    }
}

var EventManager = function () {
    this.initialize();
};

EventManager.prototype = {
    initialize: function () {
        this.listeners = {};
    },
    addListener: function (event, fn) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        if (fn instanceof Function) {
            this.listeners[event].push(fn);
        }
        return this;
    },
    dispatchEvent: function (event, params) {
        if (this.listeners[event]) {
            for (var index = 0, l = this.listeners[event].length; index < l; index++) {
                this.listeners[event][index].call(exports, params);
            }
        }
    },
    removeListener: function (event, fn) {
        if (this.listeners[event]) {
            for (var i = 0, l = this.listners[event].length; i < l; i++) {
                if (this.listners[event][i] === fn) {
                    this.listners[event].slice(i, 1);
                    break;
                }
            }
        }
    }
};

(exports).Main = Main;
(exports).System = System;
(exports).EventManager = EventManager;
(exports).ApiLogger = ApiLogger;
(exports).Config = Config;
(exports).Command = Command;
(exports).DataSourceFactory = DataSource.DataSourceFactory;