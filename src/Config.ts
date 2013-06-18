///<reference path='System/IO/FileManager.ts'/>

declare var unescape;

class Repo {
    public uriList: string[] = [];
}

class Config {
    public static FILE_NAME = 'tsd-config.json';

    public version: string = "v3";
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

	public load(cfg?) {
	    var cfg = cfg || Config.tryGetConfigFile();
	    this.typingsPath = Config.isNull(cfg, 'typingsPath', 'typings');
	    this.dependencies = Config.isNull(cfg, 'dependencies', []);
	    this.version = Config.isNull(cfg, 'version', this.version);
	    this.repo = Config.isNull(cfg, 'repo', {
	        uriList: [
                "http://www.tsdpm.com/repository_v2.json"
            ]
	    });
	}

	public save() {
	    var dep = {};
	    for (var attr in this.dependencies) {
	        dep[attr] = this.dependencies[attr];
	    }

	    var cfg = {
            typingsPath: this.typingsPath,
	        repo: this.repo,
            version: this.version,
	        dependencies: dep
	    };

	    var sw = System.IO.FileManager.handle.createFile(Config.FILE_NAME);
	    sw.write(JSON.stringify(cfg, null, 4));
	    sw.flush();
	    sw.close();
	}

	public addDependency(name: string, version: string, key: string, uri: string, repo: string) {
	    this.dependencies[name + '@' + version] = { repo: repo, key: key, uri: uri };
	}
}