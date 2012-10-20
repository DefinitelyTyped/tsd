///<reference path='IDataSource.ts'/>

declare var require: any;

class FileSystemDataSource implements IDataSource {

    private _fs: any = require('fs');

	constructor(public repositoryPath: string) {}

	public all(callback: (data: string) => void): Lib[] {
		this._fs.readFile(this.repositoryPath, function (err, data) {
		  if (err) throw err;
		  callback(JSON.parse(data));
		});
		return null;
	}
	public find(keys: string[]): Lib {
		return null;
	}
	public get(query: IQueryLibContent): LibContent {
		return null;
	}
}