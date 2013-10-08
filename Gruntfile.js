module.exports = function (grunt) {
	'use strict';

	var isVagrant = (process.env.PWD === '/vagrant');
	if (isVagrant) {
		grunt.log.writeln('-> ' + 'vagrant detected'.cyan);
	}
	var cpuCores = require('os').cpus().length;

	var gtx = require('gruntfile-gtx').wrap(grunt);

	gtx.loadNpm([
		'grunt-contrib-jshint',
		'grunt-contrib-copy',
		'grunt-contrib-clean',
		'grunt-tslint',
		'grunt-typescript',
		'grunt-execute',
		'grunt-shell',
		'grunt-todos',
		'grunt-mocha-test'
	]);
	// gtx.autoNpmPkg();
	// gtx.autoNpm();
	// gtx.loadTasks('tasks');

	//defaults and one-off tasks
	gtx.addConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: grunt.util._.defaults(grunt.file.readJSON('.jshintrc'), {
				reporter: './node_modules/jshint-path-reporter'
			}),
			support: ['Gruntfile.js', 'tasks/**/*.js', 'test/*.js', 'lib/**/*.js'],
			fixtures: ['test/**/fixtures/**/*.js']
		},
		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json'),
				formatter: 'tslint-path-formatter'
			},
			source: ['src/**/*.ts'],
			helper: ['test/*.ts'],
			tests: ['test/*.ts', 'test/*/.ts', 'test/**/src/**/*.ts']
		},
		todos: {
			options: {
				reporter: require('./lib/grunt/todos-reporter').make(grunt),
				verbose: false,
				priorities: {
					low: null,
					med: /(TODO|FIXME)/
				}

			},
			all: {
				options: {},
				src: ['src/**/*.ts', 'test/**/src/**/*.ts']
			}
		},
		clean: {
			tmp: ['tmp/**/*', 'test/tmp/**/*'],
			build: ['build/*.js', 'build/*.js.map']
		},
		copy: {
			cli: {
				src: ['src/cli.js'],
				dest: 'build/cli.js'
			}
		},
		mochaTest: {
			options: {
				reporter: 'mocha-unfunk-reporter',
				timeout: 3000
			},
			integrity: ['test/integrity.js']
		},
		typescript: {
			options: {
				module: 'commonjs',
				target: 'es5',
				base_path: 'src/',
				declaration: false,
				sourcemap: true
			},
			api: {
				src: ['src/api.ts'],
				dest: 'build/api.js'
			},
			cli: {
				src: ['src/cli.ts'],
				dest: 'build/cli.js'
			},
			dev: {
				src: ['src/dev.ts'],
				dest: 'tmp/dev.js'
			}
		},
		shell: {
			cli: {
				command: 'node ./build/cli --help',
				options: {
					stdout: true
				}
			}
		},
		execute: {
			dev: {
				before: function (grunt) {
					grunt.log.writeln('devdevedvedv');
				},
				src: ['tmp/dev.js']
			}
		}
	});

	// module tester
	gtx.define('moduleTest', function (macro, id) {
		var testPath = 'test/modules/' + id + '/';

		macro.newTask('clean', [testPath + 'tmp/**/*']);
		macro.newTask('tslint', {
			src: [testPath + 'src/**/*.ts']
		});
		macro.newTask('typescript', {
			options: {
				base_path: testPath
			},
			src: [testPath + 'src/**/*.ts'],
			dest: testPath + 'tmp/' + id + '.test.js'
		});
		macro.newTask('mochaTest', {
			options: {
				timeout: macro.getParam('timeout', 3000)
			},
			src: [testPath + 'tmp/**/*.test.js']
		});
		macro.tag('module');
		//TODO expand gruntfile-gtx to support a run-once dependency (like tslint:source)
	}, {
		concurrent: cpuCores
	});

	// assemble!
	gtx.alias('prep', ['clean:tmp', 'jshint:support', 'jshint:fixtures']);

	// cli commands
	gtx.alias('build', ['prep', 'clean:build', 'typescript:api', 'typescript:cli', 'copy:cli', 'tslint:source', 'mochaTest:integrity']);

	gtx.alias('test', ['build', 'gtx-type:moduleTest']);
	gtx.alias('default', ['build', 'test']);

	var longTimer = (isVagrant ? 250000 : 5000);

	// modules
	gtx.create('xm', 'moduleTest', null, 'lib');
	gtx.create('git', 'moduleTest', {timeout: longTimer}, 'lib');
	gtx.create('tsd', 'moduleTest', {timeout: longTimer}, 'lib');
	gtx.create('core,api,cli', 'moduleTest', {timeout: longTimer}, 'core');

	gtx.alias('run', ['build', 'shell:cli']);
	gtx.alias('dev', ['prep', 'typescript:dev', 'execute:dev']);

	// additional editor toolbar mappings
	gtx.alias('edit_01', 'gtx:tsd');
	gtx.alias('edit_02', 'gtx:api');
	//gtx.alias('edit_03', 'build', 'gtx:cli');
	gtx.alias('edit_03', 'gtx:core');
	gtx.alias('edit_04', 'gtx:git');
	gtx.alias('edit_05', 'gtx:xm');

	// build and send to grunt.initConfig();
	gtx.finalise();
};