///<reference path='d.ts/node-0.8.d.ts'/>
///<reference path='System/Console.ts'/>
///<reference path='System/IO/FileManager.ts'/>
///<reference path='System/Web/WebHandler.ts'/>

///<reference path='Command\Helper.ts'/>
///<reference path='Command\InstallCommand.ts'/>

///<reference path='Config.ts'/>
///<reference path='DataSource\DataSourceFactory.ts'/>

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

var eventManager = new EventManager();

var logProxy = {
    logger: {
        log: (msg) => {
            eventManager.dispatchEvent('log', msg);
        }
    }
};

var logger = new ApiLogger(logProxy);

// SETUP

System.Console.initialize(logger);
System.IO.FileManager.initialize();
System.IO.DirectoryManager.initialize();
System.Web.WebHandler.initialize();

function load(config: Config, callback: (tsd, err?) => any) {
    exports.commands.config = new Config();
    exports.commands.config.load(config);
    callback(exports);
}

function install(libs: string[], callback: (err?, data?) => any) {
    var command = new Command.InstallCommand(this.config);
    var args: Array = <Array><any>[];
    args[0] = '*';
    args[1] = 'api';
    args[2] = 'install';

    var cache = {};

    for (var i = 0; i < libs.length; i++) {
        if (!cache[libs[i]]) {
            cache[libs[i]] = true;
            args.push(libs[i]);
        }
    }

    command.exec(args, callback);
}

exports.load = load;
exports.commands = {
    install: install
};

exports.on = (ev: string, callback: (message: string) => any) => {
    eventManager.addListener(ev, callback);
}