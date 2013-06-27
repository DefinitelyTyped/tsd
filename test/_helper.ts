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
            var json = null;
            try {
                json = JSON.parse(file);
            }
            catch (err) {
                return callback(err, null);
            }
            return callback(null, json);
        });
    }

    export function dump(object:any, label?:string, depth?:number = 6, showHidden?:bool = false):any {
        if (typeof label !== 'undefined') {
            console.log(label + ':');
        }
        console.log(util.inspect(object, showHidden, depth, true));
    }

    export function dumpJSON(object:any, label?:string):any {
        if (typeof label !== 'undefined') {
            console.log(label + ':');
        }
        console.log(JSON.stringify(object, null, 4));
    }
}