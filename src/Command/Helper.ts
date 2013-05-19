///<reference path='../Common.ts'/>
///<reference path='ICommand.ts'/>

module Command {

    export class Helper {
        private static print(lib: DataSource.Lib, repoNumber: number) {

            var name = lib.name;
            var version = lib.versions[0].version;
            var description = lib.description;

            System.Console.writeLine(Common.format(1, 28, name) + ' ' + Common.format(0, 7, version) + ' ' + Common.format(0, 39, description) + ' ' + repoNumber.toString());
        }

        public static printLibs(libs: DataSource.Lib[], repo: TsdUri, repoNumber: number) {
            System.Console.writeLine('');
            System.Console.writeLine(' ------------------------------------------------------------------------------');
            System.Console.writeLine(' Repo [' + repoNumber + ']: ' + repo.source);
            System.Console.writeLine('');
            System.Console.writeLine(' Name                         Version Description                             R');
            System.Console.writeLine(' ---------------------------- ------- --------------------------------------- -');
            for (var i = 0; i < libs.length; i++) {
                var lib = <DataSource.Lib>libs[i];
                Helper.print(lib, repoNumber);
            }
            System.Console.writeLine(' ------------------------------------------------------------------------------');
            System.Console.writeLine(' Repo [' + repoNumber + '] - Total: ' + libs.length + ' lib(s).');
            System.Console.writeLine('');
        }

        public static getDataSource(uri: TsdUri) {
            return DataSource.DataSourceFactory.factory(uri);
        }

        public static getSourceContent(uri: TsdUri, callback: (data: string) => void): void {
            Helper.getDataSource(uri).content(callback);
        }
    }
}