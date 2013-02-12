///<reference path='IDataSource.ts'/>
///<reference path='FileSystemDataSource.ts'/>
///<reference path='WebDataSource.ts'/>
///<reference path='../Config.ts'/>

module DataSource {

    export class DataSourceFactory {
        public static factory(uri: TsdUri): IDataSource {
            if (uri.sourceType == SourceTypeEnum.FileSystem) {
                return new FileSystemDataSource(uri.source);
            } else if (uri.sourceType == SourceTypeEnum.Web) {
                return new WebDataSource(uri.source);
            } else {
                throw Error('Invalid dataSource.');
            }
        }
    }
}