///<reference path="../_ref.ts" />

module tsd {
	'use strict';

	//TODO replace reference node RegExp with a better xml parser (tony the pony)
	var referenceTagExp = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

	var leadingExp = /^\.\.\//;

	/*
	 DefUtil: static helpers
	 */
	//TODO why is DefUtil not global functions instead?
	export class DefUtil {

		static getDefs(list:tsd.DefVersion[]):tsd.Def[] {
			return list.map((def:DefVersion) => {
				return def.def;
			});
		}

		static getHeads(list:tsd.Def[]):tsd.DefVersion[] {
			return list.map((def:Def) => {
				return def.head;
			});
		}

		static getHistoryTop(list:tsd.Def[]):tsd.DefVersion[] {
			return list.map((def:Def) => {
				if (def.history.length > 0) {
					return def.history[0];
				}
				return def.head;
			});
		}

		static uniqueDefVersion(list:tsd.DefVersion[]):tsd.DefVersion[] {
			var ret:tsd.DefVersion[] = [];
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

		static uniqueDefs(list:tsd.Def[]):tsd.Def[] {
			var ret:tsd.Def[] = [];
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

		static extractReferenceTags(source:string):string[] {
			var ret:string[] = [];
			var match;

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

		static contains(list:tsd.DefVersion[], file:tsd.DefVersion):boolean {
			for (var i = 0, ii = list.length; i < ii; i++) {
				if (list[i].def.path === file.def.path) {
					return true;
				}
			}
			return false;
		}
		static mergeDependencies(list:tsd.DefVersion[]):tsd.DefVersion[] {
			var ret:tsd.DefVersion[] = [];
			for (var i = 0, ii = list.length; i < ii; i++) {
				var file = list[i];
				if (!DefUtil.contains(ret, file)) {
					ret.push(file);
				}
				for (var j = 0, jj = file.dependencies.length; j < jj; j++) {
					var tmp = file.dependencies[j];
					//TODO harden mergeDependencies
					if (!DefUtil.contains(ret, tmp.head)) {
						ret.push(tmp.head);
					}
				}
			}
			return ret;
		}

		/*static extractDependencies(list:tsd.DefVersion[]):tsd.DefVersion[] {
			var ret:tsd.DefVersion[] = [];
			for (var i = 0, ii = list.length; i < ii; i++) {
				var file = list[i];
				for (var j = 0, jj = file.dependencies.length; j < jj; j++) {
					var tmp = file.dependencies[j];
					if (!DefUtil.contains(ret, tmp) && !DefUtil.contains(list, tmp)) {
						ret.push(tmp);
					}
				}
			}
			return ret;
		}*/

		static matchCommit(list:tsd.DefVersion[], commitSha:string):tsd.DefVersion[] {
			var ret:tsd.DefVersion[] = [];
			for (var i = 0, ii = list.length; i < ii; i++) {
				var file = list[i];
				if (file.commit && file.commit.commitSha === commitSha) {
					ret.push(file);
				}
			}
			return ret;
		}

		static haveContent(list:tsd.DefVersion[]):tsd.DefVersion[] {
			var ret:tsd.DefVersion[] = [];
			for (var i = 0, ii = list.length; i < ii; i++) {
				var file = list[i];
				if (file.hasContent()) {
					ret.push(file);
				}
			}
			return ret;
		}

		static fileCompare(aa:tsd.DefVersion, bb:tsd.DefVersion):number {
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
				return -1;
			}
			//hmm.. now what?
			return -1;
		}

		static defCompare(aa:tsd.Def, bb:tsd.Def):number {
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
				return -1;
			}
			//hmm.. now what?
			return -1;
		}
	}
}
