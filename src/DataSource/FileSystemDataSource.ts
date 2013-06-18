///<reference path='IDataSource.ts'/>

declare var require:any;

module DataSource {

    export class FileSystemDataSource implements IDataSource {

        private _fs:any = require('fs');

        constructor(public repositoryPath:string){
        }

        public all(callback:(err:any, data:DataSource.Lib[]) => void):void{
            this._fs.readFile(this.repositoryPath, 'utf8', (err, body) =>{
                if (err) return callback(err, null);
                var data;
                try {
                    data = JSON.parse(body);
                }
                catch (e) {
                    return callback(e, null);
                }
                callback(null, data.repo);
            });
        }

        public find(keys:string[]):Lib{
            return null;
        }

        public content(callback:(err:any, data:string) => void):void{
            this._fs.readFile(this.repositoryPath, 'utf8', callback);
        }
    }
}