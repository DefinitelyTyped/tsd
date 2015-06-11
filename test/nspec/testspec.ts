/// <reference path="../../typings/tsd.d.ts"/>

import child_process = require('child_process');
import chai = require('chai');
import io = require('../../build/xm/fileIO');
import path = require('path');
import fs = require('fs');

var utils = require('util');
var dircompare = require('dir-compare');

// ****************************************************************
//  TODO: the io manipulation should be migrated to fileIO module
// ****************************************************************

function copyFileSync( source, target ) {
    var targetFile = target;
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }
    fs.createReadStream( source ).pipe( fs.createWriteStream( targetFile ) );
}

function copyFolderRecursiveSync( source, target, inscludeSource? ) {
    var files = [];
	var targetFolder = '';
	if (inscludeSource) {
		targetFolder = path.resolve('..', target);
	} else {
		targetFolder = path.join( target, path.basename( source ) );
	}
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

class TestCase {
	command: string;
	dirname: string;

	public static create(dirname: string): TestCase  {
		var tc = new TestCase();
		tc.dirname = dirname;
		tc.command = io.readFileSync(path.join(dirname, 'command.txt'));
		return tc;
	}

	pad(pad, str, padLeft) {
		if (typeof str === 'undefined') {
			return pad;
		}

		if (padLeft) {
			return (pad + str).slice(-pad.length);
		} else {
			return (str + pad).substring(0, pad.length);
		}
	}

	public execute(done: Function) {
		var resultDir = path.join(this.dirname, 'result');

		if (fs.existsSync(resultDir)) {
			io.removeDirSync(resultDir);
		}

		io.mkdirCheckSync(resultDir);

		if(fs.existsSync(path.join(this.dirname, 'setup'))) {
			copyFolderRecursiveSync(path.join(this.dirname, 'setup'), resultDir, true);
		}

		var cli = path.resolve(resultDir, '../../../../../build/cli.js');

		var outContent = '';
		var args = [cli];
		this.command.split(' ').forEach((arg) => {
			args = args.concat(arg.trim());
		});

		var cmd = child_process.spawn('node', args, {cwd: resultDir});

		cmd.on('error', (err) => { outContent += err; });
		cmd.stdout.on('data', (data) => { outContent += data; });
		cmd.stderr.on('data ', (data) => { outContent += data; });
		cmd.on('close', (code) => {
			io.writeFileSync(path.join(resultDir, 'out.txt'), outContent);

			var res = dircompare.compareSync(path.join(this.dirname, 'expected'), resultDir, {
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
				console.log('        - ' + this.pad(space, name1 + '(' + entry.type1 + ') ', true)
					       + state + ' ' + this.pad(space, name2 + '(' + entry.type2 + ')', true))
			});

			chai.assert.equal(0, res.differences, 'The output are not as expected');

			done();
		});
	}
}

describe('tsd test cases', function () {
	io.getDirNameList(path.join(__dirname, 'cases')).forEach((dir) => {
		it(dir, function (done) {
			this.timeout(60000);
			var testCase = TestCase.create(path.join(__dirname, 'cases', dir));
			testCase.execute(done);
		});
	});
});
