///<reference path='TTY.ts'/>
///<reference path='CommandLineProcessor.ts'/>
///<reference path='Config.ts'/>
///<reference path='DataSource\DataSourceFactory.ts'/>
///<reference path='Util\WebRequest.ts'/>
///<reference path='Util\Trace.ts'/>

declare var process: any;

class Main { 
    public run(args: Array) { 
        Util.Trace.debug = false;

        var tty = new TTY();
        Util.Trace.tty = tty;

        try { 
            Util.WebRequest.instance().init(tty);

            var cfg = new Config();
            cfg.repositoryType = RepositoryTypeEnum.Web;
            cfg.uri = "https://github.com/Diullei/tsd/raw/master/deploy/repository.json";
            cfg.localPath = "./d.ts";

            var ds = DataSource.DataSourceFactory.factory(cfg);
            var cp = new CommandLineProcessor(tty, ds, new IO(), cfg);
            cp.execute(args);
        } catch(e){
            tty.error(e.message);
        }
    }
}

new Main().run(<Array>Array.prototype.slice.call(process.argv));
