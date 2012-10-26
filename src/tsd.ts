///<reference path='d.ts/node-0.8.d.ts'/>
///<reference path='System/Console.ts'/>
///<reference path='System/IO/FileManager.ts'/>
///<reference path='System/Web/WebRequest.ts'/>

///<reference path='CommandLineProcessor.ts'/>
///<reference path='Config.ts'/>
///<reference path='DataSource\DataSourceFactory.ts'/>

var VERSION = "0.1.2";

class Main { 
    public init() { 
        System.Console.initialize();
        System.IO.FileManager.initialize();
    }

    public run(args: Array) { 

        try { 
            var cfg = new Config();

            cfg.repositoryType = RepositoryTypeEnum.Web;
            cfg.uri = "https://github.com/Diullei/tsd/raw/master/deploy/repository.json";

            //cfg.repositoryType = RepositoryTypeEnum.FileSystem;
            //cfg.uri = "repository.json";

            cfg.localPath = "./d.ts";

            var ds = DataSource.DataSourceFactory.factory(cfg);
            var cp = new CommandLineProcessor(ds, new IO(), cfg);
            cp.execute(args);
        } catch(e){
            System.Console.writeLine(e.message);
        }
    }
}

var main = new Main();
main.init();

var arguments: Array;
if (System.Environment.isNode()) {
    arguments = Array.prototype.slice.call(process.argv);
} if (System.Environment.isWsh()) {
    var args = [];
    for (var i = 0; i < WScript.Arguments.length; i++) {
        args[i] = WScript.Arguments.Item(i);
    }

    arguments = <Array><any>args;
}

main.run(arguments);
