///<reference path='IDataSource.ts'/>
///<reference path='FileSystemDataSource.ts'/>
///<reference path='WebDataSource.ts'/>
///<reference path='../Config.ts'/>

module DataSource {

    var fileUri = /^file:\/\/\//i;;
    var httpUri = /^https?:\/\//i;

    //for lazy
    var winFileUri = /^[a-zA-Z]:/;

    export class DataSourceFactory {
        public static factory(uri: string): IDataSource {

            if (fileUri.test(uri)) { // || winFileUri.test(tmp)) {
                //bastard convert uri to path
                uri = decodeURI(uri.replace(fileUri, ''));
                return new FileSystemDataSource(uri);
            }
            else if (httpUri.test(uri)) {
                return new WebDataSource(uri);
            } else {
                throw Error('Invalid dataSource uri: ' + uri);
            }
        }
    }
}