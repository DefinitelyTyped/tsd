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

// ****************************************************************
//  TODO: the io manipulation should be migrated to fileIO module
// ****************************************************************


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

class Tsd {
	constructor(private cli: string, private resultDir: string) {

	}

	public executeCommand(command: string, callback: (our: string) => void) {
		var outContent = '';
		var args = [this.cli];

		command.split(' ').forEach((arg) => { args = args.concat(arg.trim()); });

		var cmd = child_process.spawn('node', args, {cwd: this.resultDir});

		cmd.on('error', (err) => { outContent += err; });
		cmd.stdout.on('data', (data) => { outContent += data; });
		cmd.stderr.on('data ', (data) => { outContent += data; });

		cmd.on('close', (code) => {
			
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

		if (fs.existsSync(resultDir)) {
			io.removeDirSync(resultDir);
		}

		io.mkdirCheckSync(resultDir);

		if(fs.existsSync(path.join(this.dirname, 'setup'))) {
			io.copyFolderRecursiveSync(path.join(this.dirname, 'setup'), resultDir, true);
		}

		var cli = path.resolve(resultDir, '../../../../../build/cli.js');

		var outContent = '';

		var args = [cli];
		this.command.split(' ').forEach((arg) => { args = args.concat(arg.trim()); });

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
				console.log('        - ' + pad(space, name1 + '(' + entry.type1 + ') ', true)
					       + state + ' ' + pad(space, name2 + '(' + entry.type2 + ')', true));

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
