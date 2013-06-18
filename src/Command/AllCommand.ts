///<reference path='_ref.ts'/>

module Command {

    export class AllCommand extends BaseCommand {

        public shortcut: string = "all";
        public usage: string = "Show all file definitions from repository";
        private args: Array;

        constructor(public cfg: Config) { super(); }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private repoExplorer(dataSource: DataSource.IDataSource, uriList: string[], callback: (err?, data?) => any) {
             dataSource.all((err, libs) => {
                if (err) {
                    callback(err, null);
                    return;
                }

                var repoNumber = this._indexSync - 1;
                Helper.printLibs(libs, uriList[repoNumber], repoNumber);

                if (this._indexSync < uriList.length) {
                    //TODO what is returned?
                    this.repoExplorer(Helper.getDataSource(uriList[this._indexSync++]), uriList, callback);
                } else {
                    //TODO what is returned?
                    callback(null, libs);
                }
            });
        }

        //TODO this is never reset!
        private _indexSync: number = 0;
        public exec(args: Array, callback: (err?, data?) => any): void {
            var uriList = this.cfg.repo.uriList;
            if (this._indexSync < uriList.length) {
                this.repoExplorer(Helper.getDataSource(uriList[this._indexSync++]), uriList, callback);
            }
        }
    }
}