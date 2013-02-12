///<reference path='System/IO/FileManager.ts'/>

declare var unescape;

enum SourceTypeEnum {
	FileSystem,
	Web
}

class TsdUri {
    public sourceType: SourceTypeEnum;
    public source: string;
    public relative: string;
}

class Repo {
    public uriList: TsdUri[] = [];
}

class Config {
    public static FILE_NAME = 'tsd-config.json';

    public version: string = "2.0";
    public typingsPath: string;
    public libPath: string;
	public repo: Repo;
	public dependencies: any = {};

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
	    this.typingsPath = Config.isNull(cfg, 'typingsPath', 'typings');
	    this.libPath = Config.isNull(cfg, 'libPath', 'lib');
	    this.dependencies = Config.isNull(cfg, 'dependencies', []);
	    this.repo = Config.isNull(cfg, 'repo', {
	        uriList: [{
	            sourceType: SourceTypeEnum.Web,
	            source: "http://www.tsdpm.com/repository_v2.json"
	        }]
	    });
	}

	public save() {
	    var dep = {};
	    for (var attr in this.dependencies) {
	        dep[attr] = this.dependencies[attr];
	    }

	    var cfg = {
	        localPath: this.typingsPath,
	        libPath: this.libPath,
	        repo: this.repo,
	        dependencies: dep
	    };

	    var sw = System.IO.FileManager.handle.createFile(Config.FILE_NAME);
	    sw.write(JSON.stringify(cfg, null, 4));
	    sw.flush();
	    sw.close();
	}

	public addDependency(name: string, version: string, key: string, uri: TsdUri) {
	    this.dependencies[name + '@' + version] = { key: key, uri: uri };
	}
}