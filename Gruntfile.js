module.exports = function (grunt){
    'use strict';

    var path = require('path');
    var util = require('util');

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-shell');

    grunt.loadTasks('tasks');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: ['tmp', 'deploy/*.js', 'deploy/*.json', 'tools/build.js', 'DefinitelyTyped'],
            repo: ['repo/*.json']
        },
        copy: {
            export_repo: {
                files: [
                    {src: 'repo/repository.js', dest: './../tsdpm-site/tmpl/'},
                    {src: 'repo/repository_v2.json', dest: './../tsdpm-site/'}
                ]
            }
        },
        shell: {
            gitDefinitelyTypedClone: {
                command: 'git clone git://github.com/borisyankov/DefinitelyTyped.git'
            }
        },
        typescript: {
            options: {
                module: 'commonjs',
                target: 'es5',
                base_path: 'src/',
                declaration: false,
                sourcemap: false
            },
            cli: {
                src: ['src/commandLine.ts'],
                dest: 'deploy/commandLine.js'
            },
            api: {
                src: ['src/api.ts'],
                dest: 'deploy/api.js'
            }
        },
        build_repo: {
            options: {
                pretty: 2
            },
            all: {
                src: ['repo_data/*.json']
            }
        }
    });

    grunt.registerTask('compile-cli', ['typescript:cli']);
    grunt.registerTask('compile-api', ['typescript:api']);

    grunt.registerTask('git-DefinitelyTyped-clone', ['shell:gitDefinitelyTypedClone']);

    grunt.registerTask('build', ['clean:build', 'compile-api', 'compile-cli']);

    // cli commands
    grunt.registerTask('default', ['build']);
    grunt.registerTask('repo', ['default', 'clean:repo', 'build_repo:all', 'copy:export_repo']);

    // additional editor toolbar mappings
    grunt.registerTask('dev', ['repo']);
};