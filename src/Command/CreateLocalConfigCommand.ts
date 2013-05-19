///<reference path='ICommand.ts'/>
///<reference path='../Config.ts'/>
///<reference path='../System/IO/FileManager.ts'/>

module Command {

    export class CreateLocalConfigCommand extends BaseCommand {

        public shortcut: string = "ncfg";
        public usage: string = "Create a local config file";
        private args: Array;

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private saveConfigFile(): void {
            var sw = System.IO.FileManager.handle.createFile(Config.FILE_NAME);
            sw.write('{\n'
                    + '    "version": "v2",\n'
                    + '    "typingsPath": "typings",\n'
                    + '    "libPath": "lib",\n'
                    + '    "repo": {\n'
                    + '        "uriList": [{\n'
                    + '                "sourceType": "1",\n'
                    + '                "source": "http://www.tsdpm.com/repository_v2.json"\n'
                    + '            }\n'
                    + '        ]\n'
                    + '    },\n'
                    + '    "dependencies": {}\n'
                    + '}');
            sw.flush();
            sw.close();
        }

        public exec(args: Array, callback: (err?, data?) => any): void {
            if (System.IO.FileManager.handle.fileExists(Config.FILE_NAME)) {
                throw new Error("   [!] There is already a configuration file in this folder.");
            } else {
                this.saveConfigFile();
            }
            System.Console.writeLine("   [!] Configuration file created successfully.");
            System.Console.writeLine("");
        }
    }
}