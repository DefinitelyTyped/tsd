/// <reference path="../../../typings/tsd.d.ts" />

'use strict';

import fs = require('fs');
import Promise = require('bluebird');

var ctorMap = new Map<any, FSAP.API>();


function slice(args) {
	var arr = Array.prototype.slice.call(args, 0);
	if (arguments.length > 1) {
		arr.push(arguments[1]);
	}
	return arr;
}

var whitelist = [
	'rename',
	'ftruncate',
	'truncate',

	'chown',
	'fchown',
	'lchown',

	'chmod',
	'fchmod',
	'lchmod',

	'stat',
	'lstat',
	'fstat',

	'link',
	'symlink',

	'readlink',
	'realpath',

	'unlink',
	'rmdir',

	'mkdir',
	'readdir',

	'close',
	'open',

	'utimes',
	'futimes',

	'fsync',
	'read',
	'readFile',

	'writeFile',
	'write',
	'appendFile'

];
// 'exists'

function FSAP(PromiseCtor?: any): FSAP.API {
	if (!PromiseCtor && typeof Promise !== 'undefined') {
		PromiseCtor = Promise;
	}
	if (!PromiseCtor) {
		throw new Error('missing promise definition');
	}
	if (ctorMap.has(PromiseCtor)) {
		return ctorMap.get(PromiseCtor);
	}
	var ncall = (fn, name) => {
		var f = () => {
			var args: any[] = Array.prototype.slice.call(arguments, 0);
			return new PromiseCtor((resolve, reject) => {
				args.push((err, ret) => {
					if (err) {
						return reject(err);
					}
					if (arguments.length > 2) {
						return resolve(Array.prototype.splice.call(arguments, 1));
					}
					resolve(ret);
				});
				fn.apply(null, args);
			});
		};
		f['name'] = name;
		return f;
	};

	function curryNum(method, callback) {
		return function () {
			var args = slice(arguments);
			return new PromiseCtor((resolve, reject) => {
				args.push((err, res) => {
					if (err) {
						reject(err);
					}
					else {
						resolve(res);
					}
				});
				method.apply(fs, args);
			});
		};
	}

	var wrap = Object.create(fs);
	whitelist.forEach(function (prop) {
		if (typeof fs[prop] === 'function') {
			wrap[prop] = ncall(fs[prop], prop);
		}
	});
	wrap.exists = function exists(target) {
		return new PromiseCtor(function (resolve) {
			fs.exists(target, function (exists) {
				resolve(exists);
			});
		});
	};
	ctorMap.set(PromiseCtor, wrap);
	return wrap;
}

module FSAP {
	export interface API {
		rename(oldPath: string, newPath: string): Promise<void>;
		renameSync(oldPath: string, newPath: string): void;

		ftruncate(fd: string, len: number): Promise<void>;
		ftruncateSync(fd: string, len: number): void;
		truncate(path: string, len: number): Promise<void>;
		truncateSync(path: string, len: number): void;

		chown(path: string, uid: number, gid: number): Promise<void>;
		chownSync(path: string, uid: number, gid: number): void;
		fchown(fd: string, uid: number, gid: number): Promise<void>;
		fchownSync(fd: string, uid: number, gid: number): void;
		lchown(path: string, uid: number, gid: number): Promise<void>;
		lchownSync(path: string, uid: number, gid: number): void;

		chmod(path: string, mode: number): Promise<void>;
		chmodSync(path: string, mode: number): void;
		fchmod(fd: string, mode: number): Promise<void>;
		fchmodSync(fd: string, mode: number): void;
		lchmod(path: string, mode: number): Promise<void>;
		lchmodSync(path: string, mode: number): void;

		stat(path: string): Promise<fs.Stats>;
		lstat(path: string): Promise<fs.Stats>;
		fstat(fd: string): Promise<fs.Stats>;

		statSync(path: string): fs.Stats;
		lstatSync(path: string): fs.Stats;
		fstatSync(fd: string): fs.Stats;

		link(srcpath: string, dstpath: string): Promise<void>;
		linkSync(srcpath: string, dstpath: string): void;
		symlink(srcpath: string, dstpath: string, type?: string): Promise<void>;
		symlinkSync(srcpath: string, dstpath: string, type?: string): void;

		readlink(path: string): Promise<string>;
		readlinkSync(path: string): string;
		realpath(path: string, cache?: Object): Promise<string>;
		realpathSync(path: string, cache?: Object): string;

		unlink(path: string): Promise<void>;
		unlinkSync(path: string): void;

		rmdir(path: string): Promise<void>;
		rmdirSync(path: string): void;
		mkdir(path: string, mode?: number): Promise<void>;
		mkdirSync(path: string, mode?: number): void;

		readdir(path: string): Promise<string[]>;
		readdirSync(path: string): string[];

		close(fd: string): Promise<void>;
		closeSync(fd: string): void;

		open(path: string, flags: string, mode?: number): Promise<void>;
		openSync(path: string, flags: string, mode?: number): void;

		utimes(path: string, atime: number, mtime: number): Promise<void>;
		utimes(path: string, atime: Date, mtime: Date): Promise<void>;
		utimesSync(path: string, atime: number, mtime: number): void;
		utimesSync(path: string, atime: Date, mtime: Date): void;
		futimes(fd: string, atime: number, mtime: number): Promise<void>;
		futimes(fd: string, atime: Date, mtime: Date): Promise<void>;
		futimesSync(fd: string, atime: number, mtime: number): void;
		futimesSync(fd: string, atime: Date, mtime: Date): void;

		fsync(fd: string): Promise<void>;
		fsyncSync(fd: string): void;
		write(fd: string, buffer: Buffer, offset: number, length: number, position: number): Promise<number>;
		writeSync(fd: string, buffer: Buffer, offset: number, length: number, position: number): number;

		read(fd: string, buffer: Buffer, offset: number, length: number, position: number): Promise<void>;
		readSync(fd: string, buffer: Buffer, offset: number, length: number, position: number): void;

		readFile(filename: string, options?: any): Promise<Buffer>;
		readFileSync(filename: string, options?: any): Buffer;

		writeFile(filename: string, data: Buffer, options?: any): Promise<void>;
		writeFileSync(filename: string, data: Buffer, options?: any): void;
		appendFile(filename: string, data: Buffer, options?: any): Promise<void>;
		appendFileSync(filename: string, data: Buffer, options?: any): void;

		watchFile(filename: string, options?: any, listener?: (curr: fs.Stats, prev: fs.Stats) => void): void;
		unwatchFile(filename: string, listener?: (curr: fs.Stats, prev: fs.Stats) => void): void;
		watch(filename: string, options?: any, listener?: (curr: fs.Stats, prev: fs.Stats) => void): void;

		exists(path: string): Promise<boolean>;
		existsSync(path: boolean);
	}
}

export = FSAP;
