module.exports = function (grunt) {
	'use strict';

	var groan = require('./lib/groan').link(grunt);
	groan.loadNpm(
		'grunt-contrib-jshint',
		'grunt-contrib-copy',
		'grunt-contrib-clean',
		'grunt-typescript',
		'grunt-mocha-test'
	);
	// groan.autoNpm();
	groan.loadTasks('tasks');

	groan.config({
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
			tmp: ['tmp', 'test/**/_tmp.*.*', 'test/tmp/**/*'],
			build: ['build/*.js']
		},
		copy: {
		}
	});

	groan.config({
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
			}
		},
		mochaTest: {
			options: {
				reporter: 'mocha-unfunk-reporter',
				timeout: 5000
			},
			any: {
				src: ['test/**/*.test.js']
			}
		}
	});

	groan.define('typeMocha', function (grr, id) {
		grr.addTask('clean_dev');
		grr.addConf('typescript', {
			options: {base_path: 'test/' + id + '/'},
			src: ['test/' + id + '/*.ts'],
			dest: 'test/' + id + '/_tmp.test.js'
		});
		/*grr.addConf('jshint', id, {
			src: ['test/' + id + '/**_____/*.test.js']
		});*/
		//grr.task('jshint');
		grr.addConf('mochaTest', id, {
			src: ['test/' + id + '/**/*.test.js'],
			options: {
				timeout: grr.getParam('timeout', 2000)
			}
		});
		if (grr.getParam('timeout', 0) > 2000) {
			grr.addGroup('slow');
		}
	});
	groan.create('typeMocha', 'tsd', {timeout: 5000}, 'ts,core');
	groan.create('typeMocha', 'xm,git', null, 'ts,lib');

	groan.alias('compile_source', 'typescript:source');

	// groan this
	groan.alias('build_tests', 'groan-select:tsSub');

	groan.alias('test_code', 'build_tests; mochaTest');
	groan.alias('clean_dev', 'clean:tmp; clean:build');
	groan.alias('prep', 'clean_dev; jshint');

	// cli commands
	groan.alias('build', 'prep; compile_source');
	groan.alias('test', 'build; test_code');
	groan.alias('default', 'test');

	groan.alias('dev', 'prep; groan-select:ts');

	// additional editor toolbar mappings
	groan.alias('edit_01', 'groan-group:test_ts');
	groan.alias('edit_02', 'groan:tsd');
	groan.alias('edit_03', 'groan:xm');
	groan.alias('edit_04', 'groan:git');
	groan.alias('edit_05', 'groan-type:typeMocha');

	groan.init();
};