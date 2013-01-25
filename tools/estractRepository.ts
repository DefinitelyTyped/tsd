///<reference path='../src/NodeJs/DirectoryHandle.ts'/>
///<reference path='../src/NodeJs/FileHandle.ts'/>

// TEST FILE

declare var require: any;
declare var process: any;

function GUID() {
    var S4 = function () {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
    };

    return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var files = new NodeJs.DirectoryHandle().getAllFiles('.', /.\.d\.ts/g, {recursive: true});

var result = '';

for (var i = 0; i < files.length; i++) {

    if (endsWith(files[0], '-tests.ts'))
        continue;

    var name = files[i].split('/')[2];
    var guid = GUID();

    var url = 'https://github.com/borisyankov/DefinitelyTyped/raw/master/' + files[i].substr(18);

    var line = '{ "name": "' + name + '", "description": "xxx", "versions": [ { "key": "'
        + guid + '", "dependencies": [], "version": "xxx", "author": "xxx", "url": "' + url + '"}]},\n';

    result += line;
}

var sw = new NodeJs.FileHandle().createFile('repo.json');
sw.write(result);
sw.flush();
sw.close();

console.log(result)

