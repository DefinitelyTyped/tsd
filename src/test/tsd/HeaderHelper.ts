/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('graceful-fs');
import path = require('path');
import util = require('util');
import Promise = require('bluebird');

import chai = require('chai');
import assert = chai.assert;
import fileIO = require('../../xm/file/fileIO');

export class HeaderAssert {
	fields: any;
	header: any;
	key: string;

	constructor(public project: string, public name: string) {
		this.key = this.project + '/' + this.name;
	}
}

// hacky ported from old tsd-deftools fixture loader
export function loadrFixtures(src: string): Promise<HeaderAssert[]> {
	src = path.resolve(src);
	var ret: HeaderAssert[] = [];

	// brutal
	// TODO clean this up (old crude Promsie rehack)
	return getDirs(src).then((dirs: string[]) => {
		return Promise.all(dirs.reduce((memo: any[], project: string) => {
			memo.push(getDirs(path.join(src, project)).then((names: string[]) => {
				return Promise.all(names.reduce((memo: any[], name: string) => {
					var pack = path.join(src, project, name);
					memo.push(Promise.all([
						fileIO.readJSON(path.join(pack, 'fields.json')),
						fileIO.read(path.join(pack, 'header.ts'))
					]).spread((fields, header) => {
						var data = new HeaderAssert(project, name);
						data.fields = fields;
						data.header = header;
						ret.push(data);
					}));
					return memo;
				}, []));
			}));
			return memo;
		}, []));
	}).return(ret);
}

function getDirs(src: string): Promise<string[]> {
	src = path.resolve(src);
	var ret: string[] = [];
	return fileIO.readdir(src).then((names: string[]) => {
		return Promise.all(names.map((name: string) => {
			return fileIO.isDirectory(path.join(src, name)).then((isDir: boolean) => {
				if (!isDir) {
					return;
				}
				ret.push(name);
			});
		}));
	}).return(ret);
}
