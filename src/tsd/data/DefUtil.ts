///<reference path="../_ref.ts" />


module tsd {

	var referenceTag = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

	var leadingExp = /^\.\.\//;

	/*
	 DefUtil: static helpers
	 */
	//TODO why not global function instead?
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

			if (!referenceTag.global) {
				throw new Error('referenceTag RegExp must have global flag');
			}
			referenceTag.lastIndex = 0;

			while ((match = referenceTag.exec(source))) {
				if (match.length > 0 && match[1].length > 0) {
					ret.push(match[1]);
				}
			}

			return ret;
		}

		static contains(list:tsd.DefVersion[], file:tsd.DefVersion):bool {
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
					var tmp =  file.dependencies[j];
					if (!DefUtil.contains(ret, tmp)) {
						ret.push(tmp);
					}
				}
			}
			return ret;
		}

		static extractDependencies(list:tsd.DefVersion[]):tsd.DefVersion[] {
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
		}

	}
}