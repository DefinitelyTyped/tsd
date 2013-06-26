///<reference path='_ref.ts'/>

module Command {

    export class CreateLocalConfigCommand extends BaseCommand {

        public shortcut: string = "ncfg";
        public usage: string = "Create a local config file";
        private args: Array;

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private saveConfigFile(): void {
            System.IO.FileManager.handle.writeFile(Config.FILE_NAME, JSON.stringify(Config.getDefault(), null, 4));
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