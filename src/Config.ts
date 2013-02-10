///<reference path='System/IO/FileManager.ts'/>

var util = require('util');
declare var unescape;

enum RepositoryTypeEnum {
	FileSystem,
	Web
}

class RepoUri {
    public repositoryType: RepositoryTypeEnum;
    public uri: string;
}

class Repo {
    public uriList: RepoUri[] = [];
}

class Config {
    public static FILE_NAME = 'tsd-config.json';

	public localPath: string;
	public repo: Repo;
	private dependencies: any[] = [];

	private static isNull(cfg: Object, key: string, alternativeValue: any): any {
	    return cfg[key] ? cfg[key] : alternativeValue;
	}

	private static tryGetConfigFile() {
	    var cfg = {};
	    try {
	        cfg = JSON.parse(System.IO.FileManager.handle.readFile(Config.FILE_NAME));
	    } catch (e) {
	    }
	    return cfg;
	}

	public load() {
	    var cfg = Config.tryGetConfigFile();
	    this.localPath = Config.isNull(cfg, 'localPath', 'typings');
	    this.dependencies = Config.isNull(cfg, 'dependencies', []);
	    this.repo = Config.isNull(cfg, 'repo', {
	        uriList: [{
	            repositoryType: RepositoryTypeEnum.Web,
	            uri: "https://github.com/Diullei/tsd/raw/master/deploy/repository.json"
	        }]
	    });
	}

	public save() {
	    var cfg = {
	        localPath: this.localPath,
	        repo: this.repo,
            dependencies: this.dependencies
	    };
	    var sw = System.IO.FileManager.handle.createFile(Config.FILE_NAME);
	    sw.write(util.inspect(cfg, false, 10, false));
	    sw.flush();
	    sw.close();
	}

	public addDependency(name: string, version: string, key: string) {
	    this.dependencies.push({name: name, version: version, key: key});
	}
}