module.exports = function (grunt){
    'use strict';

    var path = require('path');
    var util = require('util');

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-json-schema');

    grunt.loadTasks('tasks');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            tmp : ['tmp', 'test/**/_tmp.*.*'],
            build: ['deploy/*.js', 'deploy/*.json', 'tools/build.js', 'DefinitelyTyped'],
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
            },
            test_node: {
                option: {base_path: 'test/node/'},
                src: ['test/node/*.test.ts'],
                dest: 'test/node/_tmp.test.js'
            },
            test_repo: {
                option: {base_path: 'test/repo/'},
                src: ['test/repo/*.test.ts'],
                dest: 'test/repo/_tmp.test.js'
            }
        },
        build_repo: {
            options: {
                pretty: 2
            },
            all: {
                src: ['repo_data/*.json']
            }
        },
        json_schema: {
            repo_data: {
                'files' : {
                    'schema/repo_data.json': ['repo_data/*.json']
                }
            },
            repo_v2: {
                'files' : {
                    'schema/repository_v2.json': ['repo/repository_v2.json']
                }
            },
            repo_site: {
                'files' : {
                    'schema/repository_site.json': ['repo/repository_site.json']
                }
            }
        },
        mochaTest: {
            any: {
                src: ['test/**/*.test.js'],
                options: {
                    reporter: 'mocha-unfunk-reporter'
                }
            }
        }
    });

    grunt.registerTask('compile-cli', ['typescript:cli']);
    grunt.registerTask('compile-api', ['typescript:api']);

    grunt.registerTask('validate-data', ['json_schema:repo_data']);
    grunt.registerTask('validate-repo', ['typescript:test_repo', 'mochaTest', 'json_schema:repo_v2', 'json_schema:repo_site']);

    grunt.registerTask('test-code', ['typescript:test_node', 'mochaTest']);

    grunt.registerTask('build', ['clean:tmp', 'clean:build', 'compile-api', 'compile-cli', 'test-code']);
    grunt.registerTask('repo', ['clean:tmp', 'clean:repo','test-code', 'validate-data', 'build', 'build_repo:all', 'validate-repo', 'copy:export_repo']);

    // cli commands
    grunt.registerTask('default', ['build']);
    grunt.registerTask('test', ['test-code', 'validate-data', 'validate-repo']);

    // additional editor toolbar mappings
    grunt.registerTask('dev', []);
    grunt.registerTask('edit_01', ['validate-data']);
    grunt.registerTask('edit_02', ['validate-repo']);
    grunt.registerTask('edit_03', ['repo']);
    grunt.registerTask('edit_04', []);
    grunt.registerTask('edit_05', []);
};