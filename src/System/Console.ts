///<reference path='Environment.ts'/>
///<reference path='IO/StreamWriter.ts'/>
///<reference path='../NodeJs/ConsoleWriter.ts'/>

module System {
    export class Console { 
        public static out: IO.StreamWriter;

        public static initialize(proxy?) {
            if (proxy) {
                Console.out = proxy;
            } else {
                Console.out = new NodeJs.ConsoleWriter();
            }
        }

        public static write(value: string): void { 
            Console.out.write(value);
        }

        public static writeLine(value: string): void { 
            Console.out.writeLine(value);
        }

        public static writeAsync(value: string, callback: () => void ): void { 
            Console.out.writeAsync(value, callback);
        }

        public static writeLineAsync(value: string, callback: () => void ): void { 
            Console.out.writeLineAsync(value, callback);
        }
    }
}