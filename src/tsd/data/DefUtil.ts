///<reference path="../_ref.ts" />


module tsd {

	var referenceTag = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/;

	//TODO fix duplication in logic.. why bother?
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

		static extractReferencTags(source:string):string[] {
			var ret:string[] = [];
			var match;
			referenceTag.lastIndex = 0;
			while ((match = referenceTag.exec(source))) {
				//referenceTag.lastIndex = match.index + match[0].length;
				if (match.length > 0 && match[1].length > 0) {
					ret.push(match[1]);
				}
			}
			return ret;
		}
	}
}