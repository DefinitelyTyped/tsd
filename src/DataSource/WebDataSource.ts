///<reference path='IDataSource.ts'/>
///<reference path='../System/Web/WebHandler.ts'/>

declare var require: any;

module DataSource {

    export class WebDataSource implements IDataSource {

        constructor (public repositoryUrl: string) { }

        public all(callback: (err: any, data: DataSource.Lib[]) => void ): void {
             System.Web.WebHandler.request.getUrl(this.repositoryUrl, (err, body) => {
                if (err) {
                    return callback(err, null);
                }
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