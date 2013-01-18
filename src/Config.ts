///<reference path='System/IO/FileManager.ts'/>

enum RepositoryTypeEnum {
	FileSystem,
	Web
}

class Config {
	public repositoryType: RepositoryTypeEnum;
	public uri: string;
	public localPath: string;

	public load() {
		try{
			var cfgStr = System.IO.FileManager.handle.readFile('tsd-config.json');
			var cfg = JSON.parse(cfgStr);
			this.localPath = cfg.localPath;
		}catch(e){
		    console.log(e);
			this.localPath = "d.ts";
		}
	}
}