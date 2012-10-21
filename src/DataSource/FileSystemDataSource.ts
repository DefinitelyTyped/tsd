///<reference path='IDataSource.ts'/>

declare var require: any;

module DataSource {

    export class FileSystemDataSource implements IDataSource {

        private _fs: any = require('fs');

        constructor (public repositoryPath: string) { }

        public all(callback: (data: DataSource.Lib[]) => void ): void {
            this._fs.readFile(this.repositoryPath, function (err, data) {
                if (err) throw err;
                callback(JSON.parse(data));
            });
        }
        public find(keys: string[]): Lib {
            return null;
        }
    }
}