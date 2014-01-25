/// <reference path="../_ref.ts" />

module tsd {
	'use strict';

	var semver = require('semver');

	var intMax = Math.pow(2, 53);
	var semverMax = 'v' + intMax + '.' + intMax + '.' + intMax;
	var semverMin = 'v' + 0 + '.' + 0 + '.' + 0;

	/*
	 VersionMatcher: test against DefInfo
	 */
	export class VersionMatcher {

		static latest = 'latest';
		static all = 'all';

		range:string;

		constructor(range:string) {
			if (range === VersionMatcher.latest || range === VersionMatcher.all) {
				this.range = range;
			}
			else if (range) {
				this.range = semver.validRange(range, true);
				if (!this.range) {
					xm.throwAssert('expected {a} to be a valid semver-range', range);
				}
			}
			else {
				this.range = VersionMatcher.latest;
			}
		}

		filter(list:tsd.Def[]):tsd.Def[] {
			// easy
			if (!this.range || this.range === VersionMatcher.all) {
				return list.slice(0);
			}
			// bake map
			var map = list.reduce((map:any, def:tsd.Def) => {
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
			return Object.keys(map).reduce((memo:tsd.Def[], key:string) => {
				map[key].forEach((def:tsd.Def) => {
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

		private getLatest(list:tsd.Def[]):tsd.Def {
			var latest:tsd.Def;
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
					xm.log('VersionMatcher.filter', 'gt', def.semver, latest.semver);
					latest = def;
				}
			}
			return latest;
		}
	}
}
