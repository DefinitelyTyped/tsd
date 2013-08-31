///<reference path="../_ref.ts" />


module tsd {

	var referenceTag = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/;

	export class DefUtil {

		static getHeads(list:tsd.Def[]):tsd.DefVersion[] {
			return list.map((def:Def) => {
				return def.head;
			});
		}

		static getDefs(list:tsd.DefVersion[]):tsd.Def[] {
			return list.map((def:DefVersion) => {
				return def.def;
			});
		}

		static uniqueDefPaths(list:tsd.DefVersion[]):tsd.DefVersion[] {
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

		static extractReferences(source:string):string[] {
			var ret:string[] = [];
			referenceTag.lastIndex = 0;
			var match;
			while ((match = referenceTag.exec(source))) {
				referenceTag.lastIndex = match.index + match[0].length;
				ret.push(match[1]);
			}
			return ret;
		}
	}
}