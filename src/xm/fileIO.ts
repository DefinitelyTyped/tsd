/// <reference path="_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import util = require('util');
import globMod = require('glob');
import VError = require('verror');

import Promise = require('bluebird');
import mkdirp = require('mkdirp');
import rimrafMod = require('rimraf');

import assertVar = require('./assertVar');

var mkdirpP = Promise.promisify(mkdirp);

// make nested tree from filename for high-volume folders: abcdefg.txt -> a/b/c/abcdefg.txt
export function distributeDir(base: string, name: string, levels: number, chunk: number = 1): string {
	name = name.replace(/(^[\\\/]+)|([\\\/]+$)/g, '');
	if (levels === 0) {
		return base;
	}
	if (chunk === 0) {
		return base;
	}
	var arr = [base];
	var steps = Math.max(0, Math.min(name.length - 2, levels * chunk));
	for (var i = 0; i < steps; i += chunk) {
		arr.push(name.substr(i, chunk));
	}
	return path.join.apply(path, arr);
}

export function parseJson(text: string): any {
	var json: any;
	try {
		json = JSON.parse(text);
	}
	catch (err) {
		if (err.name === 'SyntaxError') {
			// TODO find/write module to pretty print parse errors
			/*console.error(err);
			console.log('---');
			console.log(text.substr(0, 1024));
			console.log('---');*/
		}
		// rethrow
		throw (err);
	}
	return json;
}

export function readJSONSync(src: string): any {
	return parseJson(String(fs.readFileSync(src, {encoding: 'utf8'})));
}

export function readJSONCB(src: string, callback: (err: Error, res: any) => void): void {
	fs.readFile(path.resolve(src), {encoding: 'utf8'}, (err: Error, text: string) => {
		if (err || typeof text !== 'string') {
			return callback(err, null);
		}
		var json: any = null;
		try {
			json = parseJson(text);
		}
		catch (err) {
			return callback(err, null);
		}
		return callback(null, json);
	});
}

export function readJSON(src: string): Promise<any> {
	return read(src, {encoding: 'utf8'}).then((text: string) => {
		return parseJson(text);
	});
}

export function writeJSONSync(dest: string, data: any) {
	dest = path.resolve(dest);
	mkdirCheckSync(path.dirname(dest));
	fs.writeFileSync(dest, JSON.stringify(data, null, 2), {encoding: 'utf8'});
}

export function writeJSON(filename: string, data: any): Promise<void> {
	return write(filename, JSON.stringify(data, null, 2), {encoding: 'utf8'});
}

// lazy wrapper as alternative to readJSONSync
export function readFileSync(dest: string, encoding: string = 'utf8') {
	return fs.readFileSync(dest, {encoding: encoding});
}

// lazy wrapper as alternative to writeJSONSync
export function writeFileSync(dest: string, data: any, encoding: string = 'utf8') {
	dest = path.resolve(dest);
	mkdirCheckSync(path.dirname(dest), true);
	fs.writeFileSync(dest, data, {encoding: encoding});
}

/*
 mkdirCheck: like mkdirp but with writable rights and verification, synchronous
 */
// TODO unit test this
export function mkdirCheckSync(dir: string, writable: boolean = false, testWritable: boolean = false): string {
	dir = path.resolve(dir);
	if (fs.existsSync(dir)) {
		if (!fs.statSync(dir).isDirectory()) {
			throw new Error('path exists but is not a directory ' + dir);
		}
		if (writable) {
			fs.chmodSync(dir, '744');
		}
	}
	else {
		if (writable) {
			mkdirp.sync(dir, '744');
		}
		else {
			mkdirp.sync(dir);
		}
	}
	if (testWritable) {
		var testFile = path.join(dir, 'mkdirCheck_' + Math.round(Math.random() * Math.pow(10, 10)).toString(16) + '.tmp');
		try {
			fs.writeFileSync(testFile, 'test');
			fs.unlinkSync(testFile);
		}
		catch (e) {
			// rethrow
			throw new VError(e, 'no write access to %s -> %s', dir, + e);
		}
	}
	return dir;
}

/*
 mkdirCheckQ: like mkdirp but with writable rights and verification, returns a promise
 */
// TODO unit test this
// TODO why not by default make writable? why ever use this without writable?
export function mkdirCheck(dir: string, testWritable: boolean = false): Promise<string> {
	dir = path.resolve(dir);

	return exists(dir).then((exists: boolean) => {
		if (exists) {
			return isDirectory(dir).then((isDir: boolean) => {
				if (!isDir) {
					throw (new Error('path exists but is not a directory ' + dir));
				}
				return chmod(dir, '744');
			});
		}
		else {
			return mkdirpP(dir, '744');
		}
	}).then(() => {
		if (testWritable) {
			var testFile = path.join(dir, 'mkdirCheck_' + Math.round(Math.random() * Math.pow(10, 10)).toString(16) + '.tmp');

			return write(testFile, 'test').then(() => {
				return remove(testFile);
			}).catch((err) => {
				throw new Error('no write access to ' + dir + ' -> ' + err);
			});
		}
	}).return(dir);
}

export function canWriteFile(targetPath: string, overwrite: boolean) {
	return exists(targetPath).then((exists: boolean) => {
		if (!exists) {
			return Promise.resolve(true);
		}
		return isFile(targetPath).then((isFile: boolean) => {
			if (isFile) {
				return overwrite;
			}
			// TODO add folder write test?
			return false;
		});
	});
}

export function removeFile(target: string): Promise<void> {
	return exists(target).then((exists: boolean) => {
		if (!exists) {
			return;
		}
		return isFile(target).then((isFile: boolean) => {
			if (!isFile) {
				throw new Error('not a file ' + target);
			}
			return remove(target);
		});
	});
}

export function rimraf(target: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		rimrafMod(target, (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(undefined);
			}
		});
	});
}

var utimes = Promise.promisify(fs.utimes);

// TODO what about directories?
export function touchFile(src: string, atime?: Date, mtime?: Date): Promise<void> {
	return stat(src).then((stat: fs.Stats) => {
		atime = (atime || new Date());
		mtime = (mtime || stat.mtime);
		return utimes(src, atime, mtime);
	}).return();
}

export function findup(dir: string, name: string): Promise<string> {
	return Promise.attempt<string>(() => {
		if (dir === '/') {
			throw new Error('could not find package.json up from ' + dir);
		}
		else if (!dir || dir === '.') {
			throw new Error('cannot find package.json from unspecified directory');
		}
		var file = path.join(dir, name);

		return exists(file).then((exists: boolean) => {
			if (exists) {
				return Promise.resolve(file);
			}
			// one-up
			var dirName = path.dirname(dir);
			if (dirName === dir) {
				throw new Error('cannot find file ' + name);
			}
			return findup(path.dirname(dir), name).then((file: string) => {
				return file;
			});
		});
	});
}

export function exists(filename: string): any {
	return new Promise<boolean>((resolve) => {
		fs.exists(filename, resolve);
	}).catch(() => {
		return false;
	});
}

export function stat(filename: string): Promise<fs.Stats> {
	return new Promise<fs.Stats>((resolve, reject) => {
		fs.stat(filename, (err, stat: fs.Stats) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(stat);
			}
		});
	});
}

export function isFile(filename: string): Promise<boolean> {
	return stat(filename).then((stat) => {
		return stat.isFile();
	});
}

export function isDirectory(filename: string): Promise<boolean> {
	return stat(filename).then((stat) => {
		return stat.isDirectory();
	});
}

export function read(filename: string, opts?: Object): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		fs.readFile(filename, opts, (err, content) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(content);
			}
		});
	});

}

export function write(filename: string, content: any, opts?: Object): Promise<void> {
	filename = path.resolve(filename);

	return mkdirCheck(path.dirname(filename)).then(() => {
		return new Promise<void>((resolve, reject) => {
			fs.writeFile(filename, content, opts, (err) => {
				if (err) {
					reject(err);
				}
				else {
					resolve(undefined);
				}
			});
		});
	});
}

export function remove(filename: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.unlink(filename, (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(undefined);
			}
		});
	});
}

export function chmod(filename: string, mode: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.chmod(filename, mode, (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(undefined);
			}
		});
	});
}

export function glob(pattern: string, opts?: globMod.IOptions): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		globMod(pattern, (opts || {}), (err, paths: string[]) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(paths);
			}
		});
	});
}

function concat(arrays) {
	return Array.prototype.concat.apply([], arrays);
};

// lifted from Q-io
export function readdir(basePath: string): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		fs.readdir(basePath, (error, list) => {
			if (error) {
				return reject(new VError(error, 'Can\'t list %s', JSON.stringify(path)));
			}
			else {
				resolve(list);
			}
		});
	});
}

// lifted from Q-io
export function listTree(basePath: string, guard?: (basePath: string, stat: fs.Stats) => boolean): Promise<string[]> {
	basePath = String(basePath || '');
	if (!basePath) {
		basePath = '.';
	}
	guard = guard || function (basePath, stat) {
		return true;
	};
	return stat(basePath).then((stat) => {
		var paths = [];
		// true:include, false:exclude, null:no-recur
		var include = guard(basePath, stat);
		if (include) {
			paths.push([basePath]);
		}
		if (include !== null && stat.isDirectory()) {
			return readdir(basePath).then((children) => {
				paths.push.apply(paths, children.map((child) => {
					return listTree(path.join(basePath, child), guard);
				}));
				return paths;
			});
		}
		else {
			return Promise.resolve(paths);
		}
	}).catch((reason) => {
		return [];
	}).then(Promise.all).then(concat);
}
