///<reference path='IDataSource.ts'/>

declare var require: any;

module DataSource {

    export class WebDataSource implements IDataSource {

        constructor (public repositoryUrl: string) { }

        public all(callback: (data: DataSource.Lib[]) => void ): void {
            var request = Util.WebRequest.instance();

            request.getUrl(this.repositoryUrl, (body) => {
                callback(JSON.parse(body));
            });
        }
        public find(keys: string[]): Lib {
            return null;
        }
    }
}