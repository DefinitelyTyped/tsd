declare module 'fs-promise' {
  import fs = require('fs');

  export var Stats: fs.Stats;

  export function readFile (path: string, encoding?: string): Promise<any>;

  export interface WriteFileOptions {
    encoding: string;
    mode: number;
    flag: string;
  }

  export function writeFile (path: string, data: string | Buffer, options?: WriteFileOptions): Promise<void>;

  export function stat (path: string): Promise<fs.Stats>;
}
