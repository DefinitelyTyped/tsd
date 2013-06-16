///<reference path='IDataSource.ts'/>

declare var require: any;

module DataSource {

    export class FileSystemDataSource implements IDataSource {

        private _fs: any = require('fs');

        constructor (public repositoryPath: string) { }

        public all(callback: (data: DataSource.Lib[]) => void ): void {
            this._fs.readFile(this.repositoryPath, (err, data) => {
                if (err) {
                    throw new Error("Error reading file repository file: " + err.message);
                    //throw err;
                }
                callback(JSON.parse(data).repo);
            });
        }

        public find(keys: string[]): Lib {
            return null;
        }

        public content(callback: (err: any, data: string) => void ): void {
            try{
                callback(null, this._fs.readFileSync(this.repositoryPath, 'utf8'));
            }catch(e){
                callback(e, null);
            }
        }
    }
}