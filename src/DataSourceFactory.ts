///<reference path='IDataSource.ts'/>
///<reference path='FileSystemDataSource.ts'/>
///<reference path='WebDataSource.ts'/>
///<reference path='Config.ts'/>

class DataSourceFactory {
	public static factory(cfg: Config): IDataSource {
		if (cfg.repositoryType == RepositoryTypeEnum.FileSystem) {
			return new FileSystemDataSource(cfg.uri);
		} else if (cfg.repositoryType == RepositoryTypeEnum.Web) {
			return new WebDataSource(cfg.uri);
		} else {
			throw Error('Invalid dataSource.');
		}
	}
}