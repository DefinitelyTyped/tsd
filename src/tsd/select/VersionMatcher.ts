/// <reference path="../_ref.d.ts" />

import semver = require('semver');

import assert = require('../../xm/assert');
import log = require('../../xm/log');

import Def = require('../data/Def');

var intMax = Math.pow(2, 53);
var semverMax = 'v' + intMax + '.' + intMax + '.' + intMax;
var semverMin = 'v' + 0 + '.' + 0 + '.' + 0;

/*
 VersionMatcher: test against DefInfo
 */
class VersionMatcher {

	static latest = 'latest';
	static all = 'all';

	range: string;

	constructor(range: string) {
		if (range === VersionMatcher.latest || range === VersionMatcher.all) {
			this.range = range;
		}
		else if (range) {
			this.range = semver.validRange(range, true);
			assert(!!this.range, 'expected {a} to be a valid semver-range', range);
		}
		else {
			this.range = VersionMatcher.latest;
		}
	}

	filter(list: Def[]): Def[] {
		// easy
		if (!this.range || this.range === VersionMatcher.all) {
			return list.slice(0);
		}
		// bake map
		var map = list.reduce((map: any, def: Def) => {
			var id = def.project + '/' + def.name;
			if (id in map) {
				map[id].push(def);
			}
			else {
				map[id] = [def];
			}
			return map;
		}, Object.create(null));

		// filter
		if (this.range === VersionMatcher.latest) {
			return Object.keys(map).map((key) => {
				return this.getLatest(map[key]);
			});
		}

		// all that satisfy
		return Object.keys(map).reduce((memo: Def[], key: string) => {
			map[key].forEach((def: Def) => {
				if (!def.semver) {
					if (semver.satisfies(semverMax, this.range)) {
						memo.push(def);
					}
				}
				else if (semver.satisfies(def.semver, this.range)) {
					memo.push(def);
				}
			});
			return memo;
		}, []);
	}

	private getLatest(list: Def[]): Def {
		var latest: Def;
		for (var i = 0, ii = list.length; i < ii; i++) {
			var def = list[i];
			if (!def.semver) {
				// no semver means latest, bail
				return def;
			}
			else if (!latest) {
				// first latest
				latest = def;
			}
			else if (semver.gt(def.semver, latest.semver)) {
				log('VersionMatcher.filter', 'gt', def.semver, latest.semver);
				latest = def;
			}
		}
		return latest;
	}
}

export = VersionMatcher;
