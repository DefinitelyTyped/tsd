module.exports = function (grunt) {
	'use strict';

	var path = require('path');
	var util = require('util');

	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-execute');
	grunt.loadNpmTasks('grunt-shell');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			build : ['deploy/*.js', 'deploy/*.json', 'tools/build.js', 'DefinitelyTyped']
		},
		shell: {
		    gitDefinitelyTypedClone: {
		        command: 'git clone git@github.com:borisyankov/DefinitelyTyped.git'
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
			repo: {
				src: ['tools/buildRepository.ts'],
				dest: 'tools/build.js'
			}
		},
		execute: {
			repo: {
				src: ['tools/build.js']
			}
		}
	});

	grunt.registerTask('compile-cli', ['typescript:cli']);

	grunt.registerTask('compile-api', ['typescript:api']);

	grunt.registerTask('compile-repo', ['typescript:repo']);

	grunt.registerTask('exec-repo', ['execute:repo']);

	grunt.registerTask('git-DefinitelyTyped-clone', ['shell:gitDefinitelyTypedClone']);

	// cli commands
	grunt.registerTask('default', ['clean', 'compile-api', 'compile-cli']);

	grunt.registerTask('repo', ['default', 'compile-repo', 'git-DefinitelyTyped-clone', 'exec-repo']);	

	grunt.registerTask('install', ['shell:tsdInstall', 'shell:tsdDefToolsInstall']);
};