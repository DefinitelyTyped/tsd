///<reference path='IDataSource.ts'/>
///<reference path='../System/Web/WebHandler.ts'/>

declare var require: any;

module DataSource {

    export class WebDataSource implements IDataSource {

        constructor (public repositoryUrl: string) { }

        public all(callback: (err: any, data: DataSource.Lib[]) => void ): void {
            System.Web.WebHandler.request.getUrl(this.repositoryUrl, (err, body) => {
                callback(err, body ? JSON.parse(body).repo : null);
            });
        }
        public find(keys: string[]): Lib {
            return null;
        }

        public content(callback: (err: any, data: string) => void ): void {
            System.Web.WebHandler.request.getUrl(this.repositoryUrl, (err, body) => {
                callback(err, body);
            });
        }
    }
}