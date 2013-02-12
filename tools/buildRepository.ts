///<reference path='../src/NodeJs/DirectoryHandle.ts'/>
///<reference path='../src/NodeJs/FileHandle.ts'/>

//  tsc .\buildRepository.ts --out build.js | node .\build.js

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

/*
var data = JSON.parse(new NodeJs.FileHandle().readFile('../deploy/repository.json'));

for (var i = 0; i < data.length; i++) {
    console.log(data[i].name);

    var obj:any = {};
    obj.name = data[i].name;
    obj.description = data[i].description;

    obj.versions = [];

    if (data[i].versions[0].dependencies[0] == '') {
        data[i].versions[0].dependencies.pop();
    }

    if (data[i].versions[0].dependencies[0])
        data[i].versions[0].dependencies[0].version = 'latest';

    obj.versions.push({
        version: data[i].versions[0].version,
        key: data[i].versions[0].key,
        dependencies: data[i].versions[0].dependencies,
        url: data[i].versions[0].url,
        author: data[i].versions[0].author,
        author_url: data[i].versions[0].author_url
    });

    console.log(JSON.stringify(obj, null, 2));

    if (obj.versions[0].author_url) {
        var sw = new NodeJs.FileHandle().createFile('repo_data/' + data[i].name + '.json');
        sw.write(JSON.stringify(obj, null, 2));
        sw.flush();
        sw.close();
    } else {
        var sw = new NodeJs.FileHandle().createFile('repo_data/' + data[i].name + '.ERR.json');
        sw.write(JSON.stringify(obj, null, 2));
        sw.flush();
        sw.close();
    }
}
*/


//console.log(JSON.stringify(obj, null, 2));
var files = new NodeJs.DirectoryHandle().getAllFiles('../repo_data');
var repo = [];
var repo_v2 = [];
var repo_site = [];
for (var i = 0; i < files.length; i++) {
    console.log(files[i]);

    var content = new NodeJs.FileHandle().readFile(files[i]);
    var obj = JSON.parse(content);

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
            lib: {
                sources: [
/*
"folder": "",
"uri": {
	"source": "",
	"sourceType": "1"
}
*/
                ]
            }
        }]
    });
}

var sw = new NodeJs.FileHandle().createFile('../deploy/repository.json');
sw.write(JSON.stringify(repo));
sw.flush();
sw.close();

var sw2 = new NodeJs.FileHandle().createFile('../../tsdpm-site/tmpl/repository.js');
sw2.write('var __repo = ' + JSON.stringify(repo_site) + ';');
sw2.flush();
sw2.close();

var sw3 = new NodeJs.FileHandle().createFile('../deploy/repository_v2.json');
sw3.write(JSON.stringify({ repo: repo_v2 }));
sw3.flush();
sw3.close();
