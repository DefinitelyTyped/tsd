/// <reference path="../../typings/tsd.d.ts"/>

import child_process = require('child_process');
import chai = require('chai');
import io = require('../../build/xm/fileIO');
import path = require('path');
import fs = require('fs');

require('colors')

var utils = require('util');
var dircompare = require('dir-compare');
var jsdiff = require('diff');

// **********************************************************************
//  TODO: the io manipulation should be migrated/merged to fileIO module
// **********************************************************************

function copyFileSync( source, target ) {
    var targetFile = target;
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }
    fs.writeFileSync(targetFile, io.readFileSync(source).replace(/\r?\n|\r/g, '\n'));
}

function copyFolderRecursiveSync( source, target ) {
    var files = [];
    var targetFolder = path.join( target, path.basename( source ) );
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}

function pad(pad, str, padLeft) {
	if (typeof str === 'undefined') {
		return pad;
	}

	if (padLeft) {
		return (pad + str).slice(-pad.length);
	} else {
		return (str + pad).substring(0, pad.length);
	}
}

function assertDiff(expected, actual) {
	var res = dircompare.compareSync(expected, actual, {
		compareSize: true,
		compareContent: true
	});

	res.diffSet.forEach((entry) => {
		var state = {
			'equal' : '==',
			'left' : '->',
			'right' : '<-',
			'distinct' : '<>'
		}[entry.state];
		var name1 = entry.name1 ? entry.name1 : '';
		var name2 = entry.name2 ? entry.name2 : '';
		var space = '                                ';
		console.log('        - ' + pad(space, name1 + '(' + entry.type1.cyan + ') ', true)
				+ state + ' ' + pad(space, name2 + '(' + entry.type2.cyan + ')', true));

		if (entry.state === 'distinct') {
			var diff = jsdiff.diffChars(
				io.readFileSync(path.join(entry.path1, entry.name1)),
				io.readFileSync(path.join(entry.path2, entry.name2)));

			diff.forEach(function(part) {
				var color = part.added
					? 'green'
					: part.removed
						? 'red'
						: 'magenta';
				process.stderr.write(part.value[color]);
			});
		}
	});

	chai.assert.equal(0, res.differences, 'The output are not as expected');
}

class Tsd {

	constructor(private cli: string, private resultDir: string) { }

	public executeCommand(command: string, callback: (our: string) => void) {
		var outContent = '';
		var args = [this.cli];

		command.split(' ').forEach((arg) => { args = args.concat(arg.trim()); });

		var cmd = child_process.spawn('node', args, {cwd: this.resultDir});

		cmd.on('error', (err) => { outContent += err; });
		cmd.stdout.on('data', (data) => { outContent += data; });
		cmd.stderr.on('data ', (data) => { outContent += data; });

		cmd.on('close', (code) => {
			callback(outContent);
		});
	}
}

class TestCase {

	command: string;
	dirname: string;

	public static create(dirname: string): TestCase  {
		var tc = new TestCase();
		tc.dirname = dirname;
		tc.command = io.readFileSync(path.join(dirname, 'command.txt'));
		return tc;
	}

	public execute(done: Function) {
		var resultDir = path.join(this.dirname, 'result');
		var expectedDir = path.join(this.dirname, 'expected');

		var diffDir = path.join(this.dirname, 'diff');
		var diffResultDir = path.join(this.dirname, 'diff', 'result');
		var diffExpectedDir = path.join(this.dirname, 'diff', 'expected');

		if (fs.existsSync(resultDir)) {
			io.removeDirSync(resultDir);
		}

		if (fs.existsSync(diffDir)) {
			io.removeDirSync(diffDir);
		}

		fs.mkdirSync(diffDir);

		io.mkdirCheckSync(resultDir);

		if(fs.existsSync(path.join(this.dirname, 'setup'))) {
			io.copyFolderRecursiveSync(path.join(this.dirname, 'setup'), resultDir, true);
		}

		var cli = path.resolve(resultDir, '../../../../../build/cli.js');

		var tsd = new Tsd(cli, resultDir);

		var commandSplit = this.command.split(/(\r\n|\n)/mg);

		var commands = [];

		commandSplit.forEach((cmd) => {
			if (cmd.trim() !== '' && !(cmd.trim().indexOf('#') === 0)) {
				commands.push(cmd);
			}
		});

		var index = 0;
		var finalOut = '';
		var fnExec = () => {
			if (index < commands.length && (commands[index].trim() || '') !== '') {
				console.log('        command: ' + commands[index].magenta);
				tsd.executeCommand(commands[index], (out) => {
					finalOut += (index > 0 ? '\n' : '') + out;
					index++;

					fnExec();
				});
			} else {
				io.writeFileSync(path.join(resultDir, 'out.txt'), finalOut);

				copyFolderRecursiveSync(expectedDir, diffDir);
				copyFolderRecursiveSync(resultDir, diffDir);

				assertDiff(diffExpectedDir, diffResultDir);
				done();
			}
		};

		fnExec();
	}
}

describe('tsd test cases', function () {
	io.getDirNameList(path.join(__dirname, 'cases')).forEach((dir) => {
        if (dir.indexOf('_disabled.') === 0) {
            console.log('        skipped (disabled): ' + dir.substr(10));
            return;
        }

		it(dir, function (done) {
			this.timeout(60000);
			var testCase = TestCase.create(path.join(__dirname, 'cases', dir));
			testCase.execute(done);
		});
	});
});
