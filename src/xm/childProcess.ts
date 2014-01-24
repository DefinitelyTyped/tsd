/// <reference path="_ref.d.ts" />
/// <reference path="assertVar.ts" />
/// <reference path="Logger.ts" />

module xm {
	'use strict';

	var Q:typeof Q = require('q');
	var childProcess = require('child_process');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export interface RunCLIResult {
		code:number;
		error:Error;
		stdout:NodeBuffer;
		stderr:NodeBuffer;
		args:string[];
	}

	// TODO decide runCLI use fork(), exec() or spawn() (fork slightly faster? does it matter?)
	// TODO fix code to properly show errors
	export function runCLI(modulePath:string, args:string[], debug:boolean = false, cwd:string = './'):Q.Promise<RunCLIResult> {
		xm.assertVar(modulePath, 'string', 'modulePath');
		xm.assertVar(args, 'array', 'args');

		var d:Q.Deferred<RunCLIResult> = Q.defer();

		var stdout:NodeBuffer[] = [];
		var stderr:NodeBuffer[] = [];

		var options:any = {
			silent: true
		};
		if (cwd) {
			options.cwd = cwd;
		}

		var getResult = (code:number = 0, err:Error = null):RunCLIResult => {
			var res:RunCLIResult = {
				code: code,
				error: err || null,
				stdout: Buffer.concat(stdout),
				stderr: Buffer.concat(stderr),
				args: args
			};
			if (debug && res.code > 0) {
				xm.log.debug(['node', modulePath , res.args.join(' ')].join(' '));
				xm.log.debug('error: ' + res.error);
				xm.log.debug('code: ' + res.code);
				xm.log(res.stdout.toString('utf8'));
				if (res.stderr.length) {
					xm.log.error(res.stderr.toString('utf8'));
				}
			}
			return res;
		};

		args.unshift(modulePath);

		var child = childProcess.spawn('node', args, options);
		if (!child) {
			d.resolve(getResult(1, new Error('child spawned as null')));
			return d.promise;
		}

		child.stdout.on('data', (chunk:NodeBuffer) => {
			stdout.push(chunk);
			if (debug) {
				process.stdout.write(chunk);
			}
		});
		child.stderr.on('data', (chunk:NodeBuffer) => {
			stderr.push(chunk);
			if (debug) {
				process.stdout.write(chunk);
			}
		});

		child.on('error', (err:any) => {
			if (err) {
				xm.log.error('child process exited with code ' + err.code);
				xm.log.error(err);
			}
			// never fail (we might test for cli failure after all)
			d.resolve(getResult(1, err));
		});

		child.on('exit', () => {
			d.resolve(getResult(0, null));
		});

		return d.promise;
	}
}
