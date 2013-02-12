///<reference path='d.ts/node-0.8.d.ts'/>
///<reference path='System/Console.ts'/>
///<reference path='System/IO/FileManager.ts'/>
///<reference path='System/Web/WebHandler.ts'/>

///<reference path='CommandLineProcessor.ts'/>
///<reference path='Config.ts'/>
///<reference path='DataSource\DataSourceFactory.ts'/>

// *********************************************
//         GLOBAL HELP FUNCTIONS
// *********************************************

function complete(val: number) {
    var result = '';
    for (var i = 0; i < val; i++) {
        result += ' ';
    }
    return result;
}

function format(start: number, maxLen: number, text: string): string {
    return complete(start) + (text.length > maxLen ? text.substr(0, maxLen - 3) + '...' : text + complete(maxLen - text.length));
}

// *********************************************

class Main { 
    public init() { 
        System.Console.initialize();
        System.IO.FileManager.initialize();
        System.IO.DirectoryManager.initialize();
        System.Web.WebHandler.initialize();
    }

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

var main = new Main();
main.init();

var arguments: Array;

if (System.Environment.isNode()) {
    arguments = Array.prototype.slice.call(process.argv);
} if (System.Environment.isWsh()) {
    var args = [null, null];
    for (var i = 0; i < WScript.Arguments.length; i++) {
        args[2 + i] = WScript.Arguments.Item(i);
    }
    arguments = <Array><any>args;
}

main.run(arguments);
