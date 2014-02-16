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
		pkg: gtx.readJSON('package.json'),
		jshint: {
			options: gtx.readJSON('.jshintrc', {
				reporter: './node_modules/jshint-path-reporter'
			}),
			support: ['Gruntfile.js', 'test/*.js', 'lib/**/*.js'],
			fixtures: ['test/**/fixtures/**/*.js']
		},
		tslint: {
			options: {
				configuration: gtx.readJSON('tslint.json'),
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
			sourcemap: ['build/*.js.map'],
			build: ['build/*.js', 'build/*.js.map']
		},
		copy: {
			cli: {
				src: ['src/cli.js'],
				dest: 'build/cli.js'
			}
		},
		'regex-replace': {
			cli: {
				src: ['build/cli.js'],
				actions: [
					{
						name: 'eol',
						search: '\\r\\n',
						replace: '\n',
						flags: 'g'
					}
				]
			},
			build: {
				src: ['build/*.js'],
				actions: [
					{
						name: 'map',
						search: '\r?\n?\\\/\\\/# sourceMappingURL=.*',
						replace: '',
						flags: 'g'
					}
				]
			}
		},
		tv4: {
			packjson: {
				options: {
					root: function() {
						return require('package.json-schema').get();
					}
				},
				src: ['package.json']
			},
			tsd: {
				options: {
					multi: true,
					root: 'schema/tsd-v4.json'
				},
				src: ['tsd.json']
			},
			schemas: {
				options: {
					multi: true,
					root: 'http://json-schema.org/draft-04/schema#'
				},
				src: ['schema/*.json']
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
				declaration: true,
				sourcemap: true,
				noImplicitAny: false
			},
			api: {
				src: ['src/api.ts'],
				out: 'build/api.js'
			},
			blobSha: {
				src: ['src/util/blobSha.ts'],
				out: 'util/blobSha.js'
			},
			capture_task: {
				src: ['tasks/capture_cli.ts'],
				out: 'tasks/capture_cli.js'
			},
			//use this non-checked-in file to test small snippets of dev code
			dev: {
				src: ['src/dev.ts'],
				out: 'tmp/dev.js'
			}
		},
		shell: {
			options: {
				failOnError: true,
				stdout: true
			},
			demo_help: {
				command: [
					'node', './build/cli.js',
					'-h',
					'--capture',
					'--style', 'ansi'
				].join(' '),
				options: {
				}
			},
			demo_html: {
				command: [
					'node', './build/cli.js',
					'-h',
					'--style', 'html'
				].join(' '),
				options: {
				}
			}
		},
		capture_cli: {
			options: {
				modulePath: './build/cli.js',
				debug: false,
				cwd: null,
				template: path.resolve('assets', 'templates', 'cli-standard.html'),
				outDir: './media/capture'
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

		//TODO implement new gruntfile-gtx once() feature (run-once dependencies, like tslint:source or tslint:helper)
	}, {
		concurrent: 1 //cpuCores
	});

	var longTimer = (isVagrant ? 250000 : 7000);

	// modules
	gtx.create('xm', 'moduleTest', null, 'lib');
	gtx.create('git', 'moduleTest', {timeout: longTimer}, 'lib');
	gtx.create('tsd', 'moduleTest', {timeout: longTimer}, 'lib,core');
	gtx.create('core,api,cli', 'moduleTest', {timeout: longTimer}, 'core');
	gtx.create('http', 'moduleTest', {
		timeout: longTimer,
		http: 9090
	}, 'lib');

	gtx.alias('pre_publish', [
		'tv4:tsd',
		'tv4:packjson',
		'regex-replace:build',
		'regex-replace:cli',
		'clean:sourcemap',
		/*'tv4:schemas',*/
		'mochaTest:integrity'
	]);

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
		'regex-replace:cli',
		'tslint:source',
		'mochaTest:integrity',
		'shell:demo_help'
	]);
	gtx.alias('test', [
		'build',
		'tslint:helper',
		'gtx-type:moduleTest',
		'mochaTest:specs'
	]);
	gtx.alias('default', [
		'test'
	]);
	gtx.alias('demo:help', [
		'shell:demo_help'
	]);

	//gtx.alias('run', ['build', 'demo:help']);
	gtx.alias('dev', ['prep', 'ts:dev']);
	gtx.alias('run', ['capture_demo']);

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

	// capture macro
	gtx.define('capture', function (macro, id) {
		var output = './media/capture/' + id + '.html';
		var shotFull = './media/capture/' + id + '.png';
		var shotSmall = './media/capture/' + id + '-small.png';

		macro.add('clean', [
			output,
			shotFull,
			shotSmall
		]);

		macro.add('capture_cli', {
			options: {
				title: id,
				outDir: '',
				name: output,
				args: [
					'--style', 'css'
				].concat(macro.getParam('args', []))
			}
		});
		macro.add('webshot', {
			options: {
				site: output,
				savePath: shotFull,
				siteType: 'file',
				windowSize: {
					width: 1024,
					height: 400
				},
				shotSize: {
					width: macro.getParam('width', 800),
					height: macro.getParam('height', 'all')
				}
			}
		});
		if (macro.getParam('small', false)) {
			macro.add('webshot', {
				options: {
					site: output,
					savePath: shotSmall,
					siteType: 'file',
					windowSize: {
						width: 640,
						height: 768
					},
					shotSize: {
						width: 640,
						height: macro.getParam('smallHeight', 'all')
					}
				}
			});
		}
	}, {
		concurrent: cpuCores
	});
	gtx.create('help', 'capture', {
		args: [
			'help'
		],
		small: true,
		smallHeight: 400
	});
	/*gtx.create('index', 'capture', {
	 args: [
	 'query', '*'
	 ]
	 });*/
	gtx.create('async', 'capture', {
		args: [
			'query',
			'async',
			'--action', 'install',
			'--overwrite',
			'--history',
			'--info'
		]
	});
	gtx.create('angular', 'capture', {
		args: [
			'query',
			'angular*',
			'--resolve'
		]
	});
	gtx.alias('capture_demo', [
		'ts:capture_task',
		'gtx-type:capture'
	]);

	// build and send to grunt.initConfig();
	gtx.finalise();
};
