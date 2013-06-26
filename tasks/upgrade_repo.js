'use strict';

module.exports = function (grunt){

    var fs = require('fs');
    var path = require('path');
    var util = require('util');

    grunt.registerMultiTask('upgrade_repo', 'forced upgrade definition repo data format', function (){

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

        grunt.util._.each(this.filesSrc, function (src, i){

            console.log(src);
            counter++;

            var content = grunt.file.read(src);
            var obj = JSON.parse(content);

            for (var x = 0; x < obj.versions.length; x++) {
                var version = obj.versions[x];
                //update authors to new format
                if (version.author) {
                    var auth = {
                        name: version.author
                    };
                    if (version.author_url) {
                        auth.url = version.author_url;
                    }
                    version.authors = [auth];
                    delete version.author;
                    delete version.author_url;
                }
                //ditch lib
                delete version.lib;
            }

            grunt.file.write(src, JSON.stringify(obj, null, options.pretty));
            //console.log(util.inspect(obj, false, 10));
        });


        grunt.log.ok('exported ' + counter + ' definitions (' + (Date.now() - timer) + 'ms)\n');

    });
};