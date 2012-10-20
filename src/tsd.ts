///<reference path='ConsoleTTY.ts'/>
///<reference path='CommandLineProcessor.ts'/>
///<reference path='Config.ts'/>
///<reference path='DataSourceFactory.ts'/>

declare var process: any;

var args = <Array>Array.prototype.slice.call(process.argv);

var cfg = new Config();
cfg.repositoryType = RepositoryTypeEnum.Web;
cfg.uri = "https://github.com/Diullei/tsd/raw/master/deploy/repository.json";
cfg.localPath = "./d.ts";

var ds = DataSourceFactory.factory(cfg);

var cp = new CommandLineProcessor(new ConsoleTTY(), ds, new IO(), cfg);
cp.execute(args);