///<reference path='IDataSource.ts'/>
///<reference path='../System/Web/WebHandler.ts'/>

declare var require: any;

module DataSource {

    export class WebDataSource implements IDataSource {

        constructor (public repositoryUrl: string) { }

        public all(callback: (data: DataSource.Lib[]) => void ): void {
            System.Web.WebHandler.request.getUrl(this.repositoryUrl, (body) => {
                if (System.Environment.isWsh()) { 
                    callback(eval("(function(){return " + body + ";})()").repo);
                }
                else
                    callback(JSON.parse(body).repo);
            });
        }
        public find(keys: string[]): Lib {
            return null;
        }

        public content(callback: (data: string) => void ): void {
            System.Web.WebHandler.request.getUrl(this.repositoryUrl, (body) => {
                callback(body);
            });
        }
    }
}