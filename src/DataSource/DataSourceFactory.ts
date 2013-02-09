///<reference path='IDataSource.ts'/>
///<reference path='FileSystemDataSource.ts'/>
///<reference path='WebDataSource.ts'/>
///<reference path='../Config.ts'/>

module DataSource {

    export class DataSourceFactory {
        public static factory(repoUri: RepoUri): IDataSource {
            if (repoUri.repositoryType == RepositoryTypeEnum.FileSystem) {
                return new FileSystemDataSource(repoUri.uri);
            } else if (repoUri.repositoryType == RepositoryTypeEnum.Web) {
                return new WebDataSource(repoUri.uri);
            } else {
                throw Error('Invalid dataSource.');
            }
        }
    }
}