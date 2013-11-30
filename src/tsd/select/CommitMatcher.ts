///<reference path="../_ref.ts" />

module tsd {
	'use strict';

	require('date-utils');

	var fullSha = /^[0-9a-f]{40}$/;
	var hex = /^[0-9a-f]+$/g;

	/*
	 CommitMatcher
	 */
	export class CommitMatcher {

		commitSha:string;

		constructor(commitSha?:string) {
			this.commitSha = commitSha;
		}

		filter(list:tsd.DefVersion[]):tsd.DefVersion[] {
			if (!this.commitSha) {
				return list;
			}
			return list.filter(this.getFilterFunc(this.commitSha));
		}

		getFilterFunc(commitSha:string):(file:tsd.DefVersion) => boolean {
			commitSha = commitSha.toLowerCase();

			if (fullSha.test(commitSha)) {
				return (file:tsd.DefVersion) => {
					return (file.commit && file.commit.commitSha === commitSha);
				};
			}
			if (!hex.test(commitSha)) {
				xm.throwAssert('parameter not a hex {a}', commitSha);
			}
			var len = commitSha.length;
			if (len < tsd.Const.shaShorten) {
				xm.throwAssert('parameter hex too short {a}, {e}', tsd.Const.shaShorten, false);
			}
			return (file:tsd.DefVersion) => {
				return (file.commit && file.commit.commitSha.substr(0, len) === commitSha
				);
			};
		}
	}
}
