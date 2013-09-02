///<reference path="../_ref.ts" />
///<reference path="../data/DefInfo.ts" />

module tsd {
	/*
	 DefInfoMatcher: test against DefInfo
	 */
	//TODO implement InfoMatcher (something like NameMatcher)
	export class InfoMatcher {

		//return result object for uix report?
		test(info:DefInfo):bool {
			return true;
		}
	}
}