enum RepositoryTypeEnum {
	FileSystem,
	Web
}

class Config {
	public repositoryType: RepositoryTypeEnum;
	public uri: string;
	public localPath: string;

	public load(cfgFile: string) {
		//...
	}
}