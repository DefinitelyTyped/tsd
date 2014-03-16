/// <reference path="../_ref.d.ts" />

import dateUtils = require('../../xm/dateUtils');

import Def = require('../data/Def');
import DefBlob = require('../data/DefBlob');
import DefCommit = require('../data/DefCommit');
import DefIndex = require('../data/DefIndex');
import DefInfo = require('../data/DefInfo');
import DefVersion = require('../data/DefVersion');

// TODO replace reference node RegExp with a xml parser (tony the pony)
var referenceTagExp = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

export function getDefs(list: DefVersion[]): Def[] {
	return list.map((def: DefVersion) => {
		return def.def;
	});
}

export function getHeads(list: Def[]): DefVersion[] {
	return list.map((def: Def) => {
		return def.head;
	});
}

export function getHistoryTop(list: Def[]): DefVersion[] {
	return list.map((def: Def) => {
		if (def.history.length === 1) {
			return def.history[0];
		}
		else if (def.history.length > 0) {
			return def.history.sort(fileCompare)[0];
		}
		return def.head;
	});
}

export function getHistoryBottom(list: Def[]): DefVersion[] {
	return list.map((def: Def) => {
		if (def.history.length === 1) {
			return def.history[0];
		}
		else if (def.history.length > 0) {
			return def.history.sort(fileCompare)[def.history.length - 1];
		}
		return def.head;
	});
}

export function getLatest(list: DefVersion[]): DefVersion {
	if (list.length === 1) {
		return list[0];
	}
	else if (list.length > 1) {
		return list.sort(fileCompare)[0];
	}
	return null;
}

export function getRecent(list: DefVersion[]): DefVersion {
	if (list.length === 1) {
		return list[0];
	}
	else if (list.length > 1) {
		return list.sort(fileCompare)[list.length - 1];
	}
	return null;
}

export function getPaths(list: Def[]): string[] {
	return list.map((def: Def) => {
		return def.path;
	});
}

export function getPathsOf(list: DefVersion[]): string[] {
	return list.map((file: DefVersion) => {
		return file.def.path;
	});
}

export function uniqueDefVersion(list: DefVersion[]): DefVersion[] {
	var ret: DefVersion[] = [];
	outer: for (var i = 0, ii = list.length; i < ii; i++) {
		var check = list[i];
		for (var j = 0, jj = ret.length; j < jj; j++) {
			if (check.def.path === ret[j].def.path) {
				continue outer;
			}
		}
		ret.push(check);
	}
	return ret;
}

export function uniqueDefs(list: Def[]): Def[] {
	var ret: Def[] = [];
	outer: for (var i = 0, ii = list.length; i < ii; i++) {
		var check = list[i];
		for (var j = 0, jj = ret.length; j < jj; j++) {
			if (check.path === ret[j].path) {
				continue outer;
			}
		}
		ret.push(check);
	}
	return ret;
}

export function extractReferenceTags(source: string): string[] {
	var ret: string[] = [];
	var match: RegExpExecArray;

	if (!referenceTagExp.global) {
		throw new Error('referenceTagExp RegExp must have global flag');
	}
	referenceTagExp.lastIndex = 0;

	while ((match = referenceTagExp.exec(source))) {
		if (match.length > 0 && match[1].length > 0) {
			ret.push(match[1]);
		}
	}

	return ret;
}

export function contains(list: DefVersion[], file: DefVersion): boolean {
	var p = file.def.path;
	for (var i = 0, ii = list.length; i < ii; i++) {
		if (list[i].def.path === p) {
			return true;
		}
	}
	return false;
}

export function containsDef(list: Def[], def: Def): boolean {
	var p = def.path;
	for (var i = 0, ii = list.length; i < ii; i++) {
		if (list[i].path === p) {
			return true;
		}
	}
	return false;
}

export function mergeDependencies(list: DefVersion[], target?: DefVersion[]): DefVersion[] {
	target = target || [];
	for (var i = 0, ii = list.length; i < ii; i++) {
		var file = list[i];
		if (!contains(target, file)) {
			target.push(file);
			mergeDependenciesOf(file.dependencies, target);
		}
	}
	return target;
}

export function mergeDependenciesOf(list: Def[], target?: DefVersion[]): DefVersion[] {
	target = target || [];
	for (var i = 0, ii = list.length; i < ii; i++) {
		var file = list[i].head;
		if (!contains(target, file)) {
			target.push(file);
			mergeDependenciesOf(file.dependencies, target);
		}
	}
	return target;
}

/*export function extractDependencies(list:DefVersion[]):DefVersion[] {
 var ret:DefVersion[] = [];
 for (var i = 0, ii = list.length; i < ii; i++) {
 var file = list[i];
 for (var j = 0, jj = file.dependencies.length; j < jj; j++) {
 var tmp = file.dependencies[j];
 if (!contains(ret, tmp) && !contains(list, tmp)) {
 ret.push(tmp);
 }
 }
 }
 return ret;
 }*/

export function matchCommit(list: DefVersion[], commitSha: string): DefVersion[] {
	var ret: DefVersion[] = [];
	for (var i = 0, ii = list.length; i < ii; i++) {
		var file = list[i];
		if (file.commit && file.commit.commitSha === commitSha) {
			ret.push(file);
		}
	}
	return ret;
}

export function haveContent(list: DefVersion[]): DefVersion[] {
	var ret: DefVersion[] = [];
	for (var i = 0, ii = list.length; i < ii; i++) {
		var file = list[i];
		if (file.hasContent()) {
			ret.push(file);
		}
	}
	return ret;
}

export function fileCompare(aa: DefVersion, bb: DefVersion): number {
	if (!bb) {
		return 1;
	}
	if (!aa) {
		return -1;
	}
	if (aa.def.path < bb.def.path) {
		return -1;
	}
	else if (aa.def.path > bb.def.path) {
		return 1;
	}
	// hmm.. now what?
	return -1;
}

export function defCompare(aa: Def, bb: Def): number {
	if (!bb) {
		return 1;
	}
	if (!aa) {
		return -1;
	}
	if (aa.path < bb.path) {
		return -1;
	}
	else if (aa.path > bb.path) {
		return 1;
	}
	// hmm.. now what?
	return -1;
}

export function fileCommitCompare(aa: DefVersion, bb: DefVersion): number {
	var aaDate = aa.commit && aa.commit.changeDate;
	var bbDate = bb.commit && bb.commit.changeDate;
	if (!bbDate) {
		return 1;
	}
	if (!aaDate) {
		return -1;
	}
	return dateUtils.compare(aaDate, bbDate);
}
