module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');

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
				'lib/*.js'
			]
		},
		clean: {
			tmp: ['tmp', 'test/**/_tmp.*.*', 'test/tmp/**/*', ],
			build: ['build/*.js']
		},
		copy: {
		},
		typescript: {
			options: {
				module: 'commonjs',
				target: 'es5',
				base_path: 'src/',
				declaration: false,
				// should be on but is buggy
				sourcemap: false
			},
			source: {
				src: ['src/tsd.ts'],
				dest: 'build/tsd.js'
			},
			test_tsd: {
				option: {base_path: 'test/tsd/'},
				src: ['test/tsd/*.ts'],
				dest: 'test/tsd/_tmp.test.js'
			},
			test_git: {
				option: {base_path: 'test/git/'},
				src: ['test/git/*.ts'],
				dest: 'test/git/_tmp.test.js'
			},
			test_xm: {
				option: {base_path: 'test/xm/'},
				src: ['test/xm/*.ts'],
				dest: 'test/xm/_tmp.test.js'
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

	grunt.registerTask('compile_source', ['typescript:source']);

	grunt.registerTask('build_tests', [
		'typescript:test_xm',
		'typescript:test_git',
		'typescript:test_tsd'
	]);

	grunt.registerTask('test_code', ['build_tests', 'mochaTest']);

	grunt.registerTask('build', ['clean:tmp', 'clean:build', 'jshint', 'compile_source']);

	// cli commands
	grunt.registerTask('default', ['test']);
	grunt.registerTask('test', ['build', 'test_code']);

	// additional editor toolbar mappings
	grunt.registerTask('dev', []);
	grunt.registerTask('edit_01', []);
	grunt.registerTask('edit_02', []);
	grunt.registerTask('edit_03', []);
	grunt.registerTask('edit_04', []);
	grunt.registerTask('edit_05', []);
};