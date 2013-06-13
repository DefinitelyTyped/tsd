'use strict';

module.exports = function (grunt){

    var fs = require('fs');
    var path = require('path');

    grunt.registerMultiTask('build_repo', 'build definition repo data', function (){

        var options = this.options({
            pretty: 2
        });

        if (this.filesSrc.length === 0) {
            grunt.log.ok('zero files selected');
            return;
        }

        //var self = this;
        //var done = this.async();
        var counter = 0;
        var timer = Date.now();

        var repo = [];
        var repo_v2 = [];
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
                    uri: {
                        source: obj.versions[x].url,
                        sourceType: 1
                    },
                    author: {
                        name: obj.versions[x].author,
                        url: obj.versions[x].author_url
                    }
                });
                delete obj.versions[x].lib;
            }

            repo_v2.push(v2lib);

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
        });

        var repoStr_v1 = JSON.stringify(repo, null, options.pretty);
        var repoStr_v2 = JSON.stringify(repo_v2, null, options.pretty);
        var repoStr_site = JSON.stringify(repo_site, null, options.pretty);

        grunt.file.write('./repo/repository.json', repoStr_v1);
        grunt.file.write('./repo/repository_v2.json', repoStr_v2);
        grunt.file.write('./repo/repository_site.json', repoStr_site);
        grunt.file.write('./repo/repository.js', 'var __repo = ' + repoStr_site + ';');

        grunt.log.ok('exported ' + counter + ' definitions (' + (Date.now() - timer) + 'ms)\n');

    });
};