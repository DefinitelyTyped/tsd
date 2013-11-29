/*jshint -W098 */

module.exports = function (grunt) {
	'use strict';

	var path = require('path');
	var util = require('util');

	var isTravis = (process.env.TRAVIS === 'true');
	var isVagrant = (process.env.PWD === '/vagrant');
	if (isVagrant) {
		grunt.log.writeln('-> ' + 'vagrant detected'.cyan);
	}
	var cpuCores = require('os').cpus().length;
	//grunt.log.writeln(util.inspect(process.env));

	var gtx = require('gruntfile-gtx').wrap(grunt);
	gtx.loadAuto();
	gtx.loadNpm([
		'mocha-unfunk-reporter'
	]);

	//defaults and one-off tasks
	gtx.config({
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
			dump: ['test/modules/**/dump'],
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
			integrity: ['test/integrity.js'],
			// some extra js tests
			specs: ['test/specs/*.js']
		},
		mocha_unfunk: {
			dev: {
				options: {
					stackFilter: true
				}
			}
		},
		ts: {
			options: {
				module: 'commonjs',
				target: 'es5',
				declaration: false,
				sourcemap: true
			},
			api: {
				src: ['src/api.ts'],
				out: 'build/api.js'
			},
			specjsblobSha: {
				src: ['src/util/blobSha.ts'],
				out: 'util/blobSha.js'
			},
			//use this non-checked-in file to test small snippets of dev code
			dev: {
				src: ['src/dev.ts'],
				out: 'tmp/dev.js'
			}
		},
		shell: {
			demo_help: {
				command: [
					'node', './build/cli.js',
					'-h',
					'--capture'
				].join(' '),
				options: {
					stdout: true
				}
			},
			demo_html: {
				command: [
					'node', './build/cli.js',
					'-h',,
					'--capture', './media/demo-help.html',
					'--color', 'html'
				].join(' '),
				options: {
					stdout: true
				}
			},
			//use this to test stuff
			dev_hist: {
				command: [
					'node', './build/cli.js',
					'query',
					'angular',
					'--history',
					'--resolve',
					'--dev'
				].join(' '),
				options: {
					stdout: true
				}
			}
		},
		execute: {
			dev: {
				before: function (grunt) {
					grunt.log.writeln('start dev');
				},
				options: {
					module: true
				},
				after: function (grunt) {
					grunt.log.writeln('end dev');
				},
				src: ['tmp/dev.js']
			}
		}
	});

	// module tester macro
	gtx.define('moduleTest', function (macro, id) {
		var testPath = 'test/modules/' + id + '/';

		macro.add('clean', [testPath + 'tmp/**/*']);
		macro.add('ts', {
			options: {},
			src: [testPath + 'src/**/*.ts'],
			out: testPath + 'tmp/' + id + '.test.js'
		});
		macro.add('tslint', {
			src: [testPath + 'src/**/*.ts']
		});
		if (macro.getParam('http', 0) > 0) {
			macro.add('connect', {
				options: {
					port: macro.getParam('http'),
					base: testPath + 'www/'
				}
			});
		}
		macro.run('mocha_unfunk:dev');
		macro.add('mochaTest', {
			options: {
				timeout: macro.getParam('timeout', 3000)
			},
			src: [testPath + 'tmp/**/*.test.js']
		});
		macro.tag('module');

		//TODO implements new gruntfile-gtx once() feature (run-once dependencies, like tslint:source or tslint:helper)
	}, {
		concurrent: 1 //cpuCores
	});

	var longTimer = (isVagrant ? 250000 : 5000);

	// modules
	gtx.create('xm', 'moduleTest', null, 'lib');
	gtx.create('git', 'moduleTest', {timeout: longTimer}, 'lib');
	gtx.create('tsd', 'moduleTest', {timeout: longTimer}, 'lib,core');
	gtx.create('core,api,cli', 'moduleTest', {timeout: longTimer}, 'core');
	//waiting for fix in grunt-contrib-connect + node-exit
	gtx.create('http', 'moduleTest', {
		timeout: longTimer,
		http: 9090
	}, 'lib');

	// assemble!
	gtx.alias('prep', [
		'clean:tmp',
		'jshint:support',
		'jshint:fixtures',
		'mocha_unfunk:dev'
	]);
	gtx.alias('build', [
		'clean:build',
		'prep',
		'ts:api',
		'copy:cli',
		'tslint:source',
		'mochaTest:integrity',
		'shell:demo_help'
	]);
	gtx.alias('test', [
		'build',
		'tslint:helper',
		'gtx-type:moduleTest'
	]);
	gtx.alias('default', [
		'test'
	]);
	gtx.alias('demo:help', [
		'shell:demo_help'
	]);

	//gtx.alias('run', ['build', 'demo:help']);
	gtx.alias('dev', ['prep', 'ts:dev', 'execute:dev']);
	gtx.alias('run', ['build', 'shell:dev_hist']);

	gtx.alias('specjs', ['mochaTest:specs']);

	// additional editor toolbar mappings
	gtx.alias('edit_01', 'gtx:tsd');
	gtx.alias('edit_02', 'gtx:api');
	gtx.alias('edit_03', 'build', 'gtx:cli');
	gtx.alias('edit_04', 'gtx:core');
	gtx.alias('edit_05', 'gtx:git');
	gtx.alias('edit_06', 'gtx:xm');
	gtx.alias('edit_07', 'gtx:http');
	gtx.alias('edit_08', 'specjs');

	// build and send to grunt.initConfig();
	gtx.finalise();
};
