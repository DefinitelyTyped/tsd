///<reference path="../_ref.ts" />

module tsd {

	export class DefUtil {

		static getHeads(list:tsd.Definition[]):tsd.DefVersion[] {
			return list.map((def:Definition) => {
				return def.head;
			});
		}

		static getDefs(list:tsd.DefVersion[]):tsd.Definition[] {
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
	}
}