///<reference path='d.ts/node-0.8.d.ts'/>
///<reference path='System/Console.ts'/>
///<reference path='System/Web/WebRequest.ts'/>

///<reference path='TTY.ts'/>
///<reference path='CommandLineProcessor.ts'/>
///<reference path='Config.ts'/>
///<reference path='DataSource\DataSourceFactory.ts'/>
///<reference path='Util\Trace.ts'/>

class Main { 
    public init() { 
        System.Console.initialize();
    }

    public run(args: Array) { 

        Util.Trace.debug = false;

        var tty = new TTY();
        Util.Trace.tty = tty;

        try { 
            System.Web.WebRequest.instance().init(tty);

            var cfg = new Config();

            cfg.repositoryType = RepositoryTypeEnum.Web;
            cfg.uri = "https://github.com/Diullei/tsd/raw/master/deploy/repository.json";

            //cfg.repositoryType = RepositoryTypeEnum.FileSystem;
            //cfg.uri = "repository.json";

            cfg.localPath = "./d.ts";

            var ds = DataSource.DataSourceFactory.factory(cfg);
            var cp = new CommandLineProcessor(tty, ds, new IO(), cfg);
            cp.execute(args);
        } catch(e){
            tty.error(e.message);
        }
    }
}

var main = new Main();
main.init();
main.run(Array.prototype.slice.call(process.argv));
