/// <reference path="../src/xm/lib/childProcess.ts" />

(module).exports = function(grunt) {

	require('es6-shim');

	var lo_template = require('lodash-template');
	var path = require('path');
	var Q:typeof Q = require('q');

	var templates = new Map<string, {(data:Object):string}>();

	//crude quickie
	function slug(str:string):string {
		str = str.replace(/[\|\[\]\(\)\<\>\{\}\!\\\/ ]/g, '-');
		str = str.replace(/(?:^\s+)|(?:[^a-zA-Z0-9 _-])|(?:\s+$)/g, '');
		str = str.replace(/--+/g, '--');
		return str;
	}

	function getTemplate(options:any):(data:Object) => string {
		xm.assertVar(options, 'object', 'src');

		var key;
		var tmp;

		if (options.template) {
			xm.assertVar(options.template, 'string','options.template');
			key = options.template;
			if (templates.has(key)) {
				return templates.get(key);
			}
			tmp = lo_template(grunt.file.read(options.template));
			templates.set(key, tmp);
			return tmp;
		}

		xm.assertVar(options.templateString, 'string','options.templateString');

		if (options.template) {
			key = options.template;
			if (templates.has(key)) {
				return templates.get(key);
			}
			tmp = lo_template(options.templateString);
			templates.set(key, tmp);
			return tmp;
		}
		return null;
	}

	grunt.registerMultiTask('capture_cli', function() {
		var options = this.options({
			modulePath: null,
			args: [],
			debug: false,
			cwd: null,
			name: null,
			templateString: '<%= capture %>',
			outDir: './tmp'
		});

		var done = this.async();

		xm.assertVar(options.modulePath, 'string', 'options.modulePath');


		xm.runCLI(options.modulePath, options.args, options.debug, options.cwd).then((cli:xm.RunCLIResult) => {
			xm.assertVar(cli, 'object', 'cli');

			var cliOut = cli.stdout.toString('utf8');

			var template = getTemplate(options);
			var wrapped = template({
				capture: cliOut,
				title: (options.title || options.name),
				args: options.args.join(' ')
			});

			var dest = path.resolve(options.outDir, options.name);
			if (options.debug) {
				grunt.log.writeln(wrapped);
			}
			grunt.log.writeln(dest);

			grunt.file.write(dest, wrapped);
		}).done(() => {
			done(true);
		}, (err) => {
			grunt.log.fail(err);
			done(false);
		});
	});
};
