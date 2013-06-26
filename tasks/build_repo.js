'use strict';

module.exports = function (grunt){

    var fs = require('fs');
    var path = require('path');

    grunt.registerMultiTask('build_repo', 'build definition repo data', function (){

        var options = this.options({
            pretty: 2
        });

        var rimraf = require('rimraf');
        rimraf.sync('./repo');

        if (this.filesSrc.length === 0) {
            grunt.log.ok('zero files selected');
            return;
        }

        //var self = this;
        //var done = this.async();
        var counter = 0;
        var timer = Date.now();

        var repo = [];
        var repo_v3 = {repo:[]};
        var repo_site = [];

        grunt.util._.each(this.filesSrc, function (src, i){

            console.log(src);
            counter++;

            var content = grunt.file.read(src);
            var obj = JSON.parse(content);

            var v2lib = {
                name: obj.name,
                description: obj.description,
                versions: []
            };

            for (var x = 0; x < obj.versions.length; x++) {
                v2lib.versions.push({
                    version: obj.versions[x].version,
                    key: obj.versions[x].key,
                    dependencies: obj.versions[x].dependencies,
                    uri: obj.versions[x].url,
                    authors: [{
                        name: obj.versions[x].author,
                        url: obj.versions[x].author_url
                    }]
                });
                delete obj.versions[x].lib;
            }

            repo_v3.repo.push(v2lib);

            repo.push(obj);

            repo_site.push({
                name: obj.name,
                description: obj.description,
                key: obj.versions[0].key,
                dependencies: obj.versions[0].dependencies,
                version: obj.versions[0].version,
                authors: [{
                    name: obj.versions[0].author,
                    url: obj.versions[0].author_url
                }],
                url: obj.versions[0].url
            });
        });

        var repoStr_v1 = JSON.stringify(repo, null, options.pretty);
        var repoStr_v3 = JSON.stringify(repo_v3, null, options.pretty);
        var repoStr_site = JSON.stringify(repo_site, null, options.pretty);

        grunt.file.write('./repo/repository.json', repoStr_v1);
        grunt.file.write('./repo/repository_v3.json', repoStr_v3);
        grunt.file.write('./repo/repository_site.json', repoStr_site);
        grunt.file.write('./repo/repository.js', 'var __repo = ' + repoStr_site + ';');

        var AdmZip = require('adm-zip');
        var zip = new AdmZip();
        zip.addFile('repository_v3.json', repoStr_v3);
        zip.writeZip('./repo/repository_v3.zip');

        grunt.log.ok('exported ' + counter + ' definitions (' + (Date.now() - timer) + 'ms)\n');

    });
};