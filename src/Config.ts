///<reference path='System/IO/FileManager.ts'/>

declare var unescape;

enum RepositoryTypeEnum {
	FileSystem,
	Web
}

class Config {
    public static FILE_NAME = 'tsd-config.json';

	public repositoryType: RepositoryTypeEnum;
	public uri: string;
	public localPath: string;

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
	    this.repositoryType = Config.isNull(cfg, 'repositoryType', RepositoryTypeEnum.Web);
	    this.uri = Config.isNull(cfg, 'uri', "https://github.com/Diullei/tsd/raw/master/deploy/repository.json");
	}
}