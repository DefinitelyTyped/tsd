///<reference path='IDataSource.ts'/>

declare var require: any;

class WebDataSource implements IDataSource {

    private _request: any = require('request');

	constructor(public repositoryUrl: string) {}

	public all(callback: (data: string) => void): void {
		this._request(this.repositoryUrl, function (error, response, body) {
			if (!error && response.statusCode == 200) {
		        callback(JSON.parse(body));
			}
		});
	}
	public find(keys: string[]): Lib {
		return null;
	}
	public get(query: IQueryLibContent): LibContent {
		return null;
	}
}