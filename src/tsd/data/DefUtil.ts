///<reference path="../_ref.ts" />

//TODO remove inlined def (weird priority failure)
declare var Date:{
	compare(date1:Date, date2:Date):number; // -1 if date1 is smaller than date2, 0 if equal, 1 if date2 is smaller than date1
};

module tsd {
	'use strict';

	require('date-utils');

	//TODO replace reference node RegExp with a xml parser (tony the pony)
	var referenceTagExp = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

	var leadingExp = /^\.\.\//;

	/*
	 DefUtil: static helpers
	 */
	//TODO why is DefUtil not a module with global functions instead?
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

		static getPaths(list:tsd.Def[]):string[] {
			return list.map((def:Def) => {
				return def.path;
			});
		}

		static getPathsOf(list:tsd.DefVersion[]):string[] {
			return list.map((file:DefVersion) => {
				return file.def.path;
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
			var match:RegExpExecArray;

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
			var p = file.def.path;
			for (var i = 0, ii = list.length; i < ii; i++) {
				if (list[i].def.path === p) {
					return true;
				}
			}
			return false;
		}

		static containsDef(list:tsd.Def[], def:tsd.Def):boolean {
			var p = def.path;
			for (var i = 0, ii = list.length; i < ii; i++) {
				if (list[i].path === p) {
					return true;
				}
			}
			return false;
		}

		static mergeDependencies(list:tsd.DefVersion[], target?:tsd.DefVersion[]):tsd.DefVersion[] {
			var ret:tsd.DefVersion[] = target || [];
			for (var i = 0, ii = list.length; i < ii; i++) {
				var file = list[i];
				if (!DefUtil.contains(ret, file)) {
					ret.push(file);
					DefUtil.mergeDependenciesOf(file.dependencies, ret);
				}
			}
			return ret;
		}

		static mergeDependenciesOf(list:tsd.Def[], target?:tsd.DefVersion[]):tsd.DefVersion[] {
			var ret:tsd.DefVersion[] = target || [];
			for (var i = 0, ii = list.length; i < ii; i++) {
				var file = list[i].head;
				if (!DefUtil.contains(ret, file)) {
					ret.push(file);
					DefUtil.mergeDependenciesOf(file.dependencies, ret);
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
				return 1;
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
				return 1;
			}
			//hmm.. now what?
			return -1;
		}

		static fileCommitCompare(aa:tsd.DefVersion, bb:tsd.DefVersion):number {
			var aaDate = aa.commit && aa.commit.changeDate;
			var bbDate = bb.commit && bb.commit.changeDate;
			if (!bbDate) {
				return 1;
			}
			if (!aaDate) {
				return -1;
			}
			return Date.compare(aaDate, bbDate);
		}
	}
}
