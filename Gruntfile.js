module.exports = function (grunt){
    'use strict';

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-tv4');

    grunt.loadTasks('tasks');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: grunt.util._.defaults(grunt.file.readJSON('.jshintrc'), {
                reporter: './node_modules/jshint-path-reporter'
            }),
            all: [
                'Gruntfile.js',
                'tasks/*.js',
            ]
        },
        clean: {
            tmp : ['tmp', 'test/**/_tmp.*.*', 'test/node/typings', 'test/node/tsd-config.json'],
            build: ['deploy/*.js', 'deploy/*.json', 'tools/build.js', 'DefinitelyTyped'],
            repo: ['repo/*.*']
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
            },
            tsdInstall: {
                command: 'npm install'
            },
            tsdDefToolsInstall: {
                command: 'npm install ./tsd-deftools'
            }
        },
        typescript: {
            options: {
                module: 'commonjs',
                target: 'es5',
                base_path: 'src/',
                declaration: false,
                sourcemap: true
            },
            source: {
                src: ['src/source.ts'],
                dest: 'deploy/source.js'
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
        upgrade_repo: {
            options: {
                pretty: 2
            },
            all: {
                src: ['repo_data/*.json']
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
        tv4: {
            repo_data: {
                files : {
                    'schema/repo_data.json': ['repo_data/*.json']
                }
            },
            repo_v3: {
                files : {
                    'schema/repository_v3.json': ['repo/repository_v3.json']
                }
            },
            repo_site: {
                files : {
                    'schema/repository_site.json': ['repo/repository_site.json']
                }
            }
        },
        mochaTest: {
            any: {
                src: ['test/**/*.test.js'],
                options: {
                    reporter: 'mocha-unfunk-reporter',
                    timeout: 5000
                }
            }
        }
    });

    grunt.registerTask('compile-source', ['typescript:source']);

    grunt.registerTask('validate-data', ['tv4:repo_data']);
    grunt.registerTask('validate-repo', ['typescript:test_repo', 'mochaTest', 'tv4:repo_v3', 'tv4:repo_site']);

    grunt.registerTask('test-code', ['typescript:test_node', 'jshint', 'mochaTest']);

    grunt.registerTask('build', ['clean:tmp', 'clean:build', 'compile-source', 'test-code']);
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