///<reference path="_ref.ts" />

module helper {

    var fs = require('fs');
    var path = require('path');
    var util = require('util');

    export function readJSON(src:string):any{
        return JSON.parse(fs.readFileSync(src, 'utf8'));
    }

    export function loadJSON(src:string, callback:(err, res:any) => void){
        fs.readFile(path.resolve(src), 'utf8', (err, file) =>{
            if (err || !file) return callback(err, null);
            try {
                return callback(null, JSON.parse(file));
            }
            catch (err) {
                return callback(err, null);
            }
            return callback(null, null);
        });
    }

    export function dump(object:any, label?:string = '', depth?:number = 6, showHidden?:bool = false):any{
        if (label) {
            console.log(label + ':');
        }
        console.log(util.inspect(object, showHidden, depth, true));
    }

    export function dumpJSON(object:any, label?:string = ''):any{
        if (console.log) {
            console.log(label + ':');
        }
        console.log(JSON.stringify(object, null, 4));
    }
}