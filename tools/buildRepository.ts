///<reference path='../src/NodeJs/DirectoryHandle.ts'/>
///<reference path='../src/NodeJs/FileHandle.ts'/>

//  tsc .\buildRepository.ts --out build.js | node .\build.js

var fs = require('fs');

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

function fromFile(lib, name, version) {
    var sources = [];

    var lb: any = {};

    lb.uri = {};
    lb.uri.sourceType = 1;
    lb.uri.relative = name + "/" + version;
    lb.uri.source = lib.file;

    sources.push(lb);

    return sources;
}

function fromTsdLibs(lib, name, version) {
    var sources = [];

    var targetDir = '../../tsd-libs/libs/' + lib.dir;
    var files = new NodeJs.DirectoryHandle().getAllFiles(targetDir, null, { recursive: true });

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var fileName = file.substr(targetDir.length + 1);
        console.log(fileName)

        var lb: any = { uri: {} };
        lb.uri.sourceType = 1;
        lb.uri.relative = name + (version ? "/" + version : "");
        lb.uri.source = 'https://raw.github.com/Diullei/tsd-libs/master/libs/' + lib.dir + '/' + fileName;
        lb.uri.pre = '/Diullei/tsd-libs/master/libs/' + lib.dir + '/';
        sources.push(lb);
    }

    return sources;
}

//function fromZip(lib, name, version) {
//    var AdmZip = require('adm-zip');

//    request(lib.file, (error, response, body) => {
//        if (error) {
//        } else {
//            fs.writeFileSync('c:/temp/a.zip', body);
//            var zip = new AdmZip("c:/temp/a.zip");
//            var zipEntries = zip.getEntries();
//            zipEntries.forEach(function (zipEntry) {
//                console.log(zipEntry.toString());
//            });
//        }
//    });
//}

function buildSource(lib, name, version) {
    var result: any = {};

    if (lib) {
        if (lib.target == 'file') {
            result.sources = fromFile(lib, name, version)
        } else if (lib.target == 'tsd-libs') {
            result.sources = fromTsdLibs(lib, name, version)
        }
    }

    return result;
}

//console.log(JSON.stringify(obj, null, 2));
var files = new NodeJs.DirectoryHandle().getAllFiles('../repo_data');
var repo = [];
var repo_v2 = [];
var repo_site = [];

var docs = [];

for (var i = 0; i < files.length; i++) {
    console.log(files[i]);

    var content = new NodeJs.FileHandle().readFile(files[i]);
    var obj = JSON.parse(content);

    //docs.push({html: dtsdoc.loadSourceFile('class Test{name:string;}')});

    var v2lib = {
        name: obj.name,
        description: obj.description,
        versions: []
    };

    for (var x = 0; x < obj.versions.length; x++){
        if (obj.versions[x].lib && obj.versions[x].lib.target === 'file') {
            v2lib.versions.push({
                version: obj.versions[x].version,
                key: obj.versions[x].key,
                dependencies: obj.versions[x].dependencies,
                uri: {
                    source: obj.versions[x].url,
                    sourceType: 1
                },
                author: {
                    name: obj.versions[x].author,
                    url: obj.versions[x].author_url,
                },
                lib: buildSource(obj.versions[x].lib, obj.name, obj.versions[x].version)
            });
        }
        delete obj.versions[x].lib;
    }

    repo_v2.push(v2lib);

    /*
    repo_v2.push({
        name: obj.name,
        description: obj.description,
        versions: [{
            version: obj.versions[0].version,
            key: obj.versions[0].key,
            dependencies: obj.versions[0].dependencies,
            uri: {
                source: obj.versions[0].url,
                sourceType: 1
            },
            author: {
                name: obj.versions[0].author,
                url: obj.versions[0].author_url,
            },
            lib: obj.versions[0].lib || {}
        }]
    });*/

    repo.push(obj);

    repo_site.push({
        name: obj.name,
        description: obj.description,
        key: obj.versions[0].key,
        dependencies: obj.versions[0].dependencies,
        version: obj.versions[0].version,
        author: obj.versions[0].author,
        author_url: obj.versions[0].author_url,
        url: obj.versions[0].url
    });
}

var sw = new NodeJs.FileHandle().createFile('../deploy/repository.json');
sw.write(JSON.stringify(repo, null, 4));
sw.flush();
sw.close();

var sw2 = new NodeJs.FileHandle().createFile('../../tsdpm-site/tmpl/repository.js');
sw2.write('var __repo = ' + JSON.stringify(repo_site + ';', null, 4));
sw2.flush();
sw2.close();

var sw3 = new NodeJs.FileHandle().createFile('../../tsdpm-site/repository_v2.json');
sw3.write(JSON.stringify({ repo: repo_v2 }, null, 4));
sw3.flush();
sw3.close();
